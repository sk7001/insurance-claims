package com.edutech.insurance_claims_processing_system.controller;

import com.edutech.insurance_claims_processing_system.entity.Investigation;
import com.edutech.insurance_claims_processing_system.service.InvestigationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investigator")
public class InvestigatorController {

    @Autowired
    private InvestigationService investigationService;

    @PostMapping("/investigation")
    public ResponseEntity<Investigation> createInvestigation(
            @RequestBody Investigation investigation) {

        Investigation saved = investigationService.createInvestigation(investigation);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/investigation/{id}")
    public ResponseEntity<Investigation> updateInvestigation(
            @PathVariable Long id,
            @RequestBody Investigation investigationDetails) {

        Investigation updated = investigationService.updateInvestigation(id, investigationDetails);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/investigations")
    public List<Investigation> getAllInvestigations() {
        return investigationService.getAllInvestigations();
    }
}
