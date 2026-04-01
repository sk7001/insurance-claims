package com.edutech.insurance_claims_processing_system.entity;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

@Entity
public class Underwriter extends User {

    @OneToMany(mappedBy = "underwriter")
    private List<Claim> claims;

    public Underwriter() {}

    public List<Claim> getClaims() { return claims; }
    public void setClaims(List<Claim> claims) { this.claims = claims; }
}