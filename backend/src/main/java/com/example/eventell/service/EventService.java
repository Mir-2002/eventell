package com.example.eventell.service;

import com.example.eventell.domain.CreateEventRequest;
import com.example.eventell.domain.entities.Event;
import java.util.UUID;

public interface EventService {

    Event createEvent(UUID organizerId, CreateEventRequest event);
}
