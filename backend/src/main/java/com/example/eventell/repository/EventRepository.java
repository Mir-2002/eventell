package com.example.eventell.repository;

import com.example.eventell.domain.entities.Event;
import com.example.eventell.domain.entities.EventStatusEnum;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, UUID> {

    Page<Event> findByOrganizerId(UUID organizerId,  Pageable pageable);

    Optional<Event> findByIdAndOrganizerId(UUID id, UUID organizerId);

    Page<Event> findByStatus(EventStatusEnum status, Pageable pageable);

    Optional<Event> findByIdAndStatus(UUID id, EventStatusEnum status);

    @Query("""
        SELECT e FROM Event e
        WHERE e.status = :status
        AND (LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(e.venue) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
        """)
    Page<Event> searchEvents(
        @Param("status") EventStatusEnum status,
        @Param("searchTerm") String searchTerm,
        Pageable pageable
    );

}
