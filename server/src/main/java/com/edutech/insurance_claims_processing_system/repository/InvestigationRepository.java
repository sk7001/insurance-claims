package com.edutech.insurance_claims_processing_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.insurance_claims_processing_system.entity.Investigation;
import com.edutech.insurance_claims_processing_system.entity.Investigator;

@Repository
public interface InvestigationRepository extends JpaRepository<Investigation, Long> {
}