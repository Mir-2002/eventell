package com.example.eventell.service;

import com.example.eventell.domain.entities.QrCode;
import com.example.eventell.domain.entities.Ticket;
import java.util.UUID;

public interface QrCodeService {

    QrCode generateQrCode(Ticket ticket);
    byte[] getQrCodeImageForUserAndTicket(UUID userId, UUID ticketId);
}
