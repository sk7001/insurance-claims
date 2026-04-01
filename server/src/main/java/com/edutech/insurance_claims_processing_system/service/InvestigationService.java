package com.edutech.insurance_claims_processing_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.insurance_claims_processing_system.entity.Investigation;
import com.edutech.insurance_claims_processing_system.repository.InvestigationRepository;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class InvestigationService {

    private final InvestigationRepository investigationRepository;

    @Autowired
    public InvestigationService(InvestigationRepository investigationRepository) {
        this.investigationRepository = investigationRepository;
    }

    public Investigation createInvestigation(Investigation investigation) {
        return investigationRepository.save(investigation);
    }

    public Investigation updateInvestigation(Long id, Investigation investigationDetails) {
        Investigation investigation = investigationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Investigation not found"));
        investigation.setReport(investigationDetails.getReport());
        investigation.setStatus(investigationDetails.getStatus());
        return investigationRepository.save(investigation);
    }

    public List<Investigation> getAllInvestigations() {
        return investigationRepository.findAll();
    }
}