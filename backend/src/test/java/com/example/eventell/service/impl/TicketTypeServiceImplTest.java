package com.example.eventell.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.eventell.domain.entities.Event;
import com.example.eventell.domain.entities.EventStatusEnum;
import com.example.eventell.domain.entities.Ticket;
import com.example.eventell.domain.entities.TicketStatusEnum;
import com.example.eventell.domain.entities.TicketType;
import com.example.eventell.domain.entities.User;
import com.example.eventell.exception.TicketTypeNotFoundException;
import com.example.eventell.exception.TicketsSoldOutException;
import com.example.eventell.exception.UserNotFoundException;
import com.example.eventell.repository.TicketRepository;
import com.example.eventell.repository.TicketTypeRepository;
import com.example.eventell.repository.UserRepository;
import com.example.eventell.service.QrCodeService;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TicketTypeServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketTypeRepository ticketTypeRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private QrCodeService qrCodeService;

    @InjectMocks
    private TicketTypeServiceImpl ticketTypeService;

    private UUID userId;
    private User user;
    private Event event;
    private TicketType ticketType;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);

        event = Event.builder().id(UUID.randomUUID()).status(EventStatusEnum.PUBLISHED).build();
        ticketType = TicketType.builder().id(UUID.randomUUID()).name("General").price(10.0)
            .totalAvailable(2).event(event).build();
    }

    @Test
    void purchaseTicketCreatesTicketAndQrCode() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(ticketTypeRepository.findByIdWithLock(ticketType.getId())).thenReturn(Optional.of(ticketType));
        when(ticketRepository.countByTypeId(ticketType.getId())).thenReturn(1);
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Ticket ticket = ticketTypeService.purchaseTicket(userId, event.getId(), ticketType.getId());

        assertThat(ticket.getStatus()).isEqualTo(TicketStatusEnum.PURCHASED);
        assertThat(ticket.getType()).isSameAs(ticketType);
        assertThat(ticket.getPurchaser()).isSameAs(user);
        verify(qrCodeService).generateQrCode(ticket);
    }

    @Test
    void purchaseTicketWithUnlimitedAvailabilitySucceeds() {
        ticketType.setTotalAvailable(null);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(ticketTypeRepository.findByIdWithLock(ticketType.getId())).thenReturn(Optional.of(ticketType));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Ticket ticket = ticketTypeService.purchaseTicket(userId, event.getId(), ticketType.getId());

        assertThat(ticket.getStatus()).isEqualTo(TicketStatusEnum.PURCHASED);
    }

    @Test
    void purchaseTicketWhenSoldOutThrows() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(ticketTypeRepository.findByIdWithLock(ticketType.getId())).thenReturn(Optional.of(ticketType));
        when(ticketRepository.countByTypeId(ticketType.getId())).thenReturn(2);

        assertThatThrownBy(() -> ticketTypeService.purchaseTicket(userId, event.getId(), ticketType.getId()))
            .isInstanceOf(TicketsSoldOutException.class);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchaseTicketForAnotherEventThrows() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(ticketTypeRepository.findByIdWithLock(ticketType.getId())).thenReturn(Optional.of(ticketType));

        assertThatThrownBy(() -> ticketTypeService.purchaseTicket(userId, UUID.randomUUID(), ticketType.getId()))
            .isInstanceOf(TicketTypeNotFoundException.class);
    }

    @Test
    void purchaseTicketForUnpublishedEventThrows() {
        event.setStatus(EventStatusEnum.DRAFT);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(ticketTypeRepository.findByIdWithLock(ticketType.getId())).thenReturn(Optional.of(ticketType));

        assertThatThrownBy(() -> ticketTypeService.purchaseTicket(userId, event.getId(), ticketType.getId()))
            .isInstanceOf(TicketTypeNotFoundException.class);
    }

    @Test
    void purchaseTicketForUnknownUserThrows() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketTypeService.purchaseTicket(userId, event.getId(), ticketType.getId()))
            .isInstanceOf(UserNotFoundException.class);
    }
}
