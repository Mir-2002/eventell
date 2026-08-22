package com.example.eventell.service;

import com.example.eventell.domain.CreateEventRequest;
import com.example.eventell.domain.UpdateEventRequest;
import com.example.eventell.domain.entities.Event;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {

    Event createEvent(UUID organizerId, CreateEventRequest event);
    Page<Event> listEventsForOrganizer(UUID organizerId, Pageable pageable);
    Optional<Event> getEventForOrganizer(UUID organizerId, UUID id);
    Event updateEventForOrganizer (UUID organizerId, UUID id, UpdateEventRequest event);
}
