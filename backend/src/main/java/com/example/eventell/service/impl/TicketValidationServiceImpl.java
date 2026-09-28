package com.example.eventell.service.impl;

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
import com.example.eventell.service.TicketValidationService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketValidationServiceImpl implements TicketValidationService {

    private final QrCodeRepository qrCodeRepository;
    private final TicketRepository ticketRepository;
    private final TicketValidationRepository ticketValidationRepository;

    @Override
    @Transactional
    public TicketValidation validateTicketByQrCode(UUID qrCodeValue) {
        QrCode qrCode = qrCodeRepository.findByValueAndStatus(qrCodeValue.toString(), QrCodeStatusEnum.ACTIVE)
            .orElseThrow(() -> new QrCodeNotFoundException(
                String.format("QR code with value '%s' doesn't exist", qrCodeValue)
            ));

        return validateTicket(qrCode.getTicket(), TicketValidationMethodEnum.QR_SCAN);
    }

    @Override
    @Transactional
    public TicketValidation validateTicketManually(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new TicketNotFoundException(
                String.format("Ticket with ID '%s' doesn't exist", ticketId)
            ));

        return validateTicket(ticket, TicketValidationMethodEnum.MANUAL);
    }

    private TicketValidation validateTicket(Ticket ticket, TicketValidationMethodEnum validationMethod) {
        // A ticket can only be validated once; any later attempt is recorded as invalid
        boolean alreadyValidated = ticket.getValidations().stream()
            .anyMatch(validation -> validation.getStatus() == TicketValidationStatusEnum.VALID);

        TicketValidationStatusEnum status = alreadyValidated || ticket.getStatus() != TicketStatusEnum.PURCHASED
            ? TicketValidationStatusEnum.INVALID
            : TicketValidationStatusEnum.VALID;

        TicketValidation ticketValidation = new TicketValidation();
        ticketValidation.setStatus(status);
        ticketValidation.setValidationMethod(validationMethod);
        ticketValidation.setTicket(ticket);
        ticket.getValidations().add(ticketValidation);

        return ticketValidationRepository.save(ticketValidation);
    }
}
