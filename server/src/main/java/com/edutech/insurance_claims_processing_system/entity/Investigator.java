package com.edutech.insurance_claims_processing_system.entity;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

@Entity
public class Investigator extends User {

    @OneToMany(mappedBy = "investigator")
    private List<Investigation> investigations;

    public Investigator() {}

    public List<Investigation> getInvestigations() { return investigations; }
    public void setInvestigations(List<Investigation> investigations) {
        this.investigations = investigations;
    }
}