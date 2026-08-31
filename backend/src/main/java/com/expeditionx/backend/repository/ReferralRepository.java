package com.expeditionx.backend.repository;

import com.expeditionx.backend.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReferralRepository extends JpaRepository<Referral, Long> {
    List<Referral> findByReferrerId(Long userId);
    Optional<Referral> findByReferralCode(String code);
    Optional<Referral> findByReferredEmail(String email);
}
