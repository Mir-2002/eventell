package com.example.eventell.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.example.eventell.domain.entities.QrCode;
import com.example.eventell.domain.entities.QrCodeStatusEnum;
import com.example.eventell.domain.entities.Ticket;
import com.example.eventell.domain.entities.TicketStatusEnum;
import com.example.eventell.domain.entities.TicketValidation;
import com.example.eventell.domain.entities.TicketValidationMethodEnum;
import com.example.eventell.domain.entities.TicketValidationStatusEnum;
import com.example.eventell.exception.QrCodeNotFoundException;
import com.example.eventell.exception.TicketNotFoundException;
import com.example.eventell.repository.QrCodeRepository;
import com.example.eventell.repository.TicketRepository;
import com.example.eventell.repository.TicketValidationRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TicketValidationServiceImplTest {

    @Mock
    private QrCodeRepository qrCodeRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketValidationRepository ticketValidationRepository;

    @InjectMocks
    private TicketValidationServiceImpl ticketValidationService;

    private Ticket ticket;
    private QrCode qrCode;

    @BeforeEach
    void setUp() {
        ticket = Ticket.builder().id(UUID.randomUUID()).status(TicketStatusEnum.PURCHASED).build();
        qrCode = QrCode.builder().id(UUID.randomUUID()).value(UUID.randomUUID().toString())
            .status(QrCodeStatusEnum.ACTIVE).ticket(ticket).build();
    }

    @Test
    void firstQrScanIsValidAndSecondIsInvalid() {
        UUID qrCodeValue = UUID.fromString(qrCode.getValue());
        when(qrCodeRepository.findByValueAndStatus(qrCode.getValue(), QrCodeStatusEnum.ACTIVE))
            .thenReturn(Optional.of(qrCode));
        when(ticketValidationRepository.save(any(TicketValidation.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        TicketValidation first = ticketValidationService.validateTicketByQrCode(qrCodeValue);
        TicketValidation second = ticketValidationService.validateTicketByQrCode(qrCodeValue);

        assertThat(first.getStatus()).isEqualTo(TicketValidationStatusEnum.VALID);
        assertThat(first.getValidationMethod()).isEqualTo(TicketValidationMethodEnum.QR_SCAN);
        assertThat(first.getTicket()).isSameAs(ticket);
        assertThat(second.getStatus()).isEqualTo(TicketValidationStatusEnum.INVALID);
        assertThat(ticket.getValidations()).containsExactly(first, second);
    }

    @Test
    void unknownQrCodeThrows() {
        UUID qrCodeValue = UUID.randomUUID();
        when(qrCodeRepository.findByValueAndStatus(qrCodeValue.toString(), QrCodeStatusEnum.ACTIVE))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketValidationService.validateTicketByQrCode(qrCodeValue))
            .isInstanceOf(QrCodeNotFoundException.class);
    }

    @Test
    void manualValidationIsValidForUnusedTicket() {
        when(ticketRepository.findById(ticket.getId())).thenReturn(Optional.of(ticket));
        when(ticketValidationRepository.save(any(TicketValidation.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        TicketValidation validation = ticketValidationService.validateTicketManually(ticket.getId());

        assertThat(validation.getStatus()).isEqualTo(TicketValidationStatusEnum.VALID);
        assertThat(validation.getValidationMethod()).isEqualTo(TicketValidationMethodEnum.MANUAL);
    }

    @Test
    void manualValidationOfCancelledTicketIsInvalid() {
        ticket.setStatus(TicketStatusEnum.CANCELLED);
        when(ticketRepository.findById(ticket.getId())).thenReturn(Optional.of(ticket));
        when(ticketValidationRepository.save(any(TicketValidation.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        TicketValidation validation = ticketValidationService.validateTicketManually(ticket.getId());

        assertThat(validation.getStatus()).isEqualTo(TicketValidationStatusEnum.INVALID);
    }

    @Test
    void manualValidationOfUnknownTicketThrows() {
        UUID ticketId = UUID.randomUUID();
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketValidationService.validateTicketManually(ticketId))
            .isInstanceOf(TicketNotFoundException.class);
    }
}
