package com.edutech.insurance_claims_processing_system.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.edutech.insurance_claims_processing_system.entity.OtpRecord;

@Repository
public interface OtpRepository extends JpaRepository<OtpRecord, Long> {
    Optional<OtpRecord> findByEmail(String email);
    void deleteByEmail(String email);
}
