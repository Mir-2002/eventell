package com.example.eventell.repository;

import com.example.eventell.domain.entities.Event;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, UUID> {

}
