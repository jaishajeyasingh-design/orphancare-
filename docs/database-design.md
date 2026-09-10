# Database Design — OrphanCare AI

## Core Entities & Relationships

```text
User ───< Child (Managed by Organization Admin)
  │
  ├─── Donor Profile ────< Donation / Sponsorship
  ├─── Volunteer Profile ───< Mentorship / Opportunities
  └─── Organization Profile

Child ───< ChildNeed
Child ───< ChildSkill
Child ───< ChildInterest
Child ───< DevelopmentPlan ───< DevelopmentGoal
Child ───< Match ───< Opportunity / Sponsor / Volunteer
Child ───< Progress
Child ───< Impact
```

## Entity Overview
- **User**: Base account (Admin, Donor, Volunteer, Caregiver).
- **Child**: Anonymized, secure child record with encrypted sensitive fields.
- **Organization**: Orphanage/Shelter managing children profiles.
- **Opportunity**: Scholarship, Mentorship program, Educational sponsorship.
- **Match**: AI-recommended pairing between a child's needs and an available opportunity/donor.
- **DevelopmentPlan**: Dynamic AI-generated roadmap with incremental milestones.
- **Progress**: Periodic logs tracking academic, emotional, and physical well-being.
- **Impact**: Aggregated metrics measuring long-term outcomes.
