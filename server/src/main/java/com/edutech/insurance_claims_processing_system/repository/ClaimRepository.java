package com.edutech.insurance_claims_processing_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.insurance_claims_processing_system.entity.Claim;
import com.edutech.insurance_claims_processing_system.entity.Policyholder;
import com.edutech.insurance_claims_processing_system.entity.Underwriter;

import java.util.List;

@Repository
public interface ClaimRepository  {
    List<Claim> findByPolicyholder(Policyholder policyholder);

    List<Claim> findByUnderwriter(Underwriter underwriter);
}

