package com.edutech.insurance_claims_processing_system.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

@Entity
public class Investigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String report;
    private String status;

    @OneToOne
    @JoinColumn(name = "claim_id")
    private Claim claim;

    @ManyToOne
    @JoinColumn(name = "investigator_id")
    private Investigator investigator;

    public Investigation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReport() { return report; }
    public void setReport(String report) { this.report = report; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Claim getClaim() { return claim; }
    public void setClaim(Claim claim) { this.claim = claim; }

    public Investigator getInvestigator() { return investigator; }
    public void setInvestigator(Investigator investigator) {
        this.investigator = investigator;
    }

}