
// package com.edutech.insurance_claims_processing_system.service;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import com.edutech.insurance_claims_processing_system.entity.Claim;
// import com.edutech.insurance_claims_processing_system.entity.Investigation;
// import com.edutech.insurance_claims_processing_system.entity.Investigator;
// import com.edutech.insurance_claims_processing_system.repository.ClaimRepository;
// import com.edutech.insurance_claims_processing_system.repository.InvestigationRepository;
// import com.edutech.insurance_claims_processing_system.repository.InvestigatorRepository;

// import javax.persistence.EntityNotFoundException;
// import java.util.List;
// import java.util.Optional;

// @Service
// public class InvestigationService {

//     private final InvestigationRepository investigationRepository;

//     public InvestigationService(InvestigationRepository investigationRepository) {
//         this.investigationRepository = investigationRepository;
//     }

//     public Investigation save(Investigation investigation) {
//         return investigationRepository.save(investigation);
//     }

//     public Optional<Investigation> findById(Long id) {
//         return investigationRepository.findById(id);
//     }

//     public List<Investigation> findAll() {
//         return investigationRepository.findAll();
//     }
// }

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