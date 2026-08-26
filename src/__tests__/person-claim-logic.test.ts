import { describe, it, expect } from "vitest";

interface PersonClaimRequestState {
  id: string;
  userId: string;
  personId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ProfileState {
  userId: string;
  personId: string | null;
}

function processClaimApproval(
  claim: PersonClaimRequestState,
  profile: ProfileState,
  decision: "APPROVE" | "REJECT"
): { claim: PersonClaimRequestState; profile: ProfileState } {
  if (decision === "APPROVE") {
    return {
      claim: { ...claim, status: "APPROVED" },
      profile: { ...profile, personId: claim.personId },
    };
  }
  return {
    claim: { ...claim, status: "REJECTED" },
    profile: { ...profile },
  };
}

describe("Person Claim & Profile Change Logic (T026)", () => {
  it("should link profile.person_id when claim is APPROVED", () => {
    const claim: PersonClaimRequestState = {
      id: "claim-1",
      userId: "user-1",
      personId: "person-100",
      status: "PENDING",
    };
    const profile: ProfileState = {
      userId: "user-1",
      personId: null,
    };

    const result = processClaimApproval(claim, profile, "APPROVE");
    expect(result.claim.status).toBe("APPROVED");
    expect(result.profile.personId).toBe("person-100");
  });

  it("should NOT link profile.person_id when claim is REJECTED", () => {
    const claim: PersonClaimRequestState = {
      id: "claim-1",
      userId: "user-1",
      personId: "person-100",
      status: "PENDING",
    };
    const profile: ProfileState = {
      userId: "user-1",
      personId: null,
    };

    const result = processClaimApproval(claim, profile, "REJECT");
    expect(result.claim.status).toBe("REJECTED");
    expect(result.profile.personId).toBe(null);
  });
});
