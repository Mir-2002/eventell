package com.example.eventell.repository;

import com.example.eventell.domain.entities.Event;
import com.example.eventell.domain.entities.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, UUID> {

    Page<Event> findByOrganizerId(UUID organizerId,  Pageable pageable);

    Optional<Event> findByIdandOrganizerId(UUID id, UUID organizerId);

    UUID organizer(User organizer);
}
