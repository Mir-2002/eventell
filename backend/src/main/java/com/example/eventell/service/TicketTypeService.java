package com.example.eventell.service;

import com.example.eventell.domain.entities.Ticket;
import java.util.UUID;

public interface TicketTypeService {

    Ticket purchaseTicket(UUID userId, UUID eventId, UUID ticketTypeId);
}
