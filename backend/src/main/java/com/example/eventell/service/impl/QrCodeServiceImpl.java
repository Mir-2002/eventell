package com.example.eventell.service.impl;

import com.example.eventell.domain.entities.QrCode;
import com.example.eventell.domain.entities.QrCodeStatusEnum;
import com.example.eventell.domain.entities.Ticket;
import com.example.eventell.exception.QrCodeGenerationException;
import com.example.eventell.exception.QrCodeNotFoundException;
import com.example.eventell.repository.QrCodeRepository;
import com.example.eventell.service.QrCodeService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QrCodeServiceImpl implements QrCodeService {

    private static final int QR_WIDTH = 300;
    private static final int QR_HEIGHT = 300;

    private final QrCodeRepository qrCodeRepository;

    @Override
    @Transactional
    public QrCode generateQrCode(Ticket ticket) {
        // The value is the payload encoded in the QR image, which staff scan to validate the ticket
        QrCode qrCode = new QrCode();
        qrCode.setStatus(QrCodeStatusEnum.ACTIVE);
        qrCode.setValue(UUID.randomUUID().toString());
        qrCode.setTicket(ticket);
        ticket.getQrCodes().add(qrCode);

        return qrCodeRepository.save(qrCode);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getQrCodeImageForUserAndTicket(UUID userId, UUID ticketId) {
        QrCode qrCode = qrCodeRepository
            .findFirstByTicketIdAndTicketPurchaserIdAndStatus(ticketId, userId, QrCodeStatusEnum.ACTIVE)
            .orElseThrow(() -> new QrCodeNotFoundException(
                String.format("QR code for ticket '%s' doesn't exist", ticketId)
            ));

        return generateQrCodeImage(qrCode.getValue());
    }

    private byte[] generateQrCodeImage(String value) {
        try {
            BitMatrix bitMatrix = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, QR_WIDTH, QR_HEIGHT);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (WriterException | IOException exception) {
            throw new QrCodeGenerationException("Failed to generate QR code image", exception);
        }
    }
}
