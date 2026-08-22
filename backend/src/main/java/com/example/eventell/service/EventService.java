package com.example.eventell.service;

import com.example.eventell.domain.CreateEventRequest;
import com.example.eventell.domain.entities.Event;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {

    Event createEvent(UUID organizerId, CreateEventRequest event);
    Page<Event> listEventsForOrganizer(UUID organizerId, Pageable pageable);
}
