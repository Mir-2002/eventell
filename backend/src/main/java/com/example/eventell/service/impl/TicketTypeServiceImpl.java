package com.example.eventell.service.impl;

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
import com.example.eventell.service.TicketTypeService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketTypeServiceImpl implements TicketTypeService {

    private final UserRepository userRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final TicketRepository ticketRepository;
    private final QrCodeService qrCodeService;

    @Override
    @Transactional
    public Ticket purchaseTicket(UUID userId, UUID eventId, UUID ticketTypeId) {
        User user = userRepository.findById(userId).orElseThrow(
            () -> new UserNotFoundException(
                String.format("User with id %s not found", userId)
            )
        );

        TicketType ticketType = ticketTypeRepository.findByIdWithLock(ticketTypeId)
            .filter(existingTicketType -> existingTicketType.getEvent() != null
                && eventId.equals(existingTicketType.getEvent().getId())
                && existingTicketType.getEvent().getStatus() == EventStatusEnum.PUBLISHED)
            .orElseThrow(() -> new TicketTypeNotFoundException(
                String.format("Ticket type with ID '%s' doesn't exist for event '%s'", ticketTypeId, eventId)
            ));

        Integer totalAvailable = ticketType.getTotalAvailable();
        if (totalAvailable != null && ticketRepository.countByTypeId(ticketTypeId) >= totalAvailable) {
            throw new TicketsSoldOutException(
                String.format("Ticket type with ID '%s' is sold out", ticketTypeId)
            );
        }

        Ticket ticket = new Ticket();
        ticket.setStatus(TicketStatusEnum.PURCHASED);
        ticket.setType(ticketType);
        ticket.setPurchaser(user);

        Ticket savedTicket = ticketRepository.save(ticket);
        qrCodeService.generateQrCode(savedTicket);

        return savedTicket;
    }
}
