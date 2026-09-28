package com.example.eventell.repository;

import com.example.eventell.domain.entities.QrCode;
import com.example.eventell.domain.entities.QrCodeStatusEnum;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QrCodeRepository extends JpaRepository<QrCode, UUID> {

    Optional<QrCode> findFirstByTicketIdAndTicketPurchaserIdAndStatus(
        UUID ticketId,
        UUID purchaserId,
        QrCodeStatusEnum status
    );

    Optional<QrCode> findByValueAndStatus(String value, QrCodeStatusEnum status);
}
