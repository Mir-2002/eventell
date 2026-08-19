package com.example.eventell.service.impl;

import com.example.eventell.domain.CreateEventRequest;
import com.example.eventell.domain.entities.Event;
import com.example.eventell.domain.entities.TicketType;
import com.example.eventell.domain.entities.User;
import com.example.eventell.exception.UserNotFoundException;
import com.example.eventell.repository.EventRepository;
import com.example.eventell.repository.UserRepository;
import com.example.eventell.service.EventService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Override
    public Event createEvent(UUID organizerId, CreateEventRequest event) {
        User organizer = userRepository.findById(organizerId).orElseThrow(
            () -> new UserNotFoundException(
                String.format("User with id %s not found", organizerId)
            )
        );
        List<TicketType> ticketTypesToCreate = event.getTicketTypes().stream().map(ticketType-> {
            TicketType ticketTypeToCreate = new TicketType();
            ticketTypeToCreate.setName(ticketType.getName());
            ticketTypeToCreate.setPrice(ticketType.getPrice());
            ticketTypeToCreate.setDescription(ticketType.getDescription());
            ticketTypeToCreate.setTotalAvailable(ticketType.getTotalAvailable());
            return ticketTypeToCreate;
        }).collect(Collectors.toList());
        Event eventToCreate = new Event();
        eventToCreate.setName(event.getName());
        eventToCreate.setStart(event.getStart());
        eventToCreate.setEnd(event.getEnd());
        eventToCreate.setVenue(event.getVenue());
        eventToCreate.setSalesStart(event.getSalesStart());
        eventToCreate.setSalesEnd(event.getSalesEnd());
        eventToCreate.setStatus(event.getStatus());
        eventToCreate.setOrganizer(organizer);
        eventToCreate.setTicketTypes(ticketTypesToCreate);

        return eventRepository.save(eventToCreate);
    }
}
