package com.example.eventell.service;

import com.example.eventell.domain.entities.TicketValidation;
import java.util.UUID;

public interface TicketValidationService {

    TicketValidation validateTicketByQrCode(UUID qrCodeValue);
    TicketValidation validateTicketManually(UUID ticketId);
}
