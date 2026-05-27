from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import Match, Message, Profile, User
from routers.auth import current_user

router = APIRouter()

COMPLEMENTARY_SKILLS = {
    "engineering": {"sales", "marketing", "fundraising", "design", "operations"},
    "full-stack engineering": {"sales", "marketing", "fundraising", "design", "healthcare"},
    "ml": {"sales", "product", "design", "compliance", "healthcare"},
    "sales": {"engineering", "full-stack engineering", "ml", "product", "design"},
    "design": {"engineering", "sales", "ml", "operations"},
    "product": {"engineering", "ml", "sales", "marketing"},
    "healthcare": {"engineering", "ml", "sales", "product"},
    "fundraising": {"engineering", "product", "design"},
}


class ProfileInput(BaseModel):
    name: str
    bio: str
    skills: list[str]
    industry: str
    startup_idea: str
    looking_for: list[str]
    avatar_url: str | None = None


class SwipeInput(BaseModel):
    target_user_id: int
    liked: bool


class MessageInput(BaseModel):
    content: str


def profile_payload(profile: Profile, score: float | None = None):
    payload = {
        "id": profile.id,
        "user_id": profile.user_id,
        "name": profile.name,
        "bio": profile.bio,
        "skills": profile.skills,
        "industry": profile.industry,
        "startup_idea": profile.startup_idea,
        "looking_for": profile.looking_for,
        "avatar_url": profile.avatar_url,
    }
    if score is not None:
        payload["compatibility_score"] = round(score, 2)
    return payload


def compatibility_score(current: Profile, candidate: Profile) -> float:
    current_skills = {skill.lower() for skill in current.skills}
    candidate_skills = {skill.lower() for skill in candidate.skills}
    current_needs = {skill.lower() for skill in current.looking_for}
    candidate_needs = {skill.lower() for skill in candidate.looking_for}

    direct_fit = len(candidate_skills & current_needs) + len(current_skills & candidate_needs)
    complementary_fit = 0
    for skill in current_skills:
        complementary_fit += len(COMPLEMENTARY_SKILLS.get(skill, set()) & candidate_skills)
    for skill in candidate_skills:
        complementary_fit += len(COMPLEMENTARY_SKILLS.get(skill, set()) & current_skills)

    industry_fit = 20 if current.industry.lower() == candidate.industry.lower() else 8
    needs_overlap = len(current_needs & candidate_needs)
    score = 35 + direct_fit * 12 + complementary_fit * 4 + industry_fit - needs_overlap * 3
    return max(0, min(100, score))


@router.post("/seed")
def seed(db: Session = Depends(get_db)):
    seed_profiles = [
        ("maya@foundermatch.dev", "Maya Chen", "GTM operator with healthcare buyer access.", ["Sales", "Fundraising", "Healthcare"], "Healthcare AI", "Provider intake automation for specialty clinics.", ["Full-stack engineering", "ML", "Product"]),
        ("leo@foundermatch.dev", "Leo Patel", "AI engineer building risk products.", ["ML", "Python", "Data pipelines"], "Fintech", "Compliance review copilot for SMB lending.", ["Sales", "Compliance", "Design"]),
        ("sofia@foundermatch.dev", "Sofia Alvarez", "Product designer focused on climate workflows.", ["Design", "Research", "Brand"], "Climate", "Retrofit financing marketplace for building owners.", ["Backend engineering", "Sales", "Energy markets"]),
    ]
    created = 0
    for email, name, bio, skills, industry, idea, looking_for in seed_profiles:
        user = db.query(User).filter(User.email == email).first()
        if user:
            continue
        user = User(email=email, password_hash=None)
        db.add(user)
        db.flush()
        profile = Profile(user_id=user.id, name=name, bio=bio, industry=industry, startup_idea=idea)
        profile.skills = skills
        profile.looking_for = looking_for
        db.add(profile)
        created += 1
    db.commit()
    return {"created": created}


@router.get("/profiles")
def list_profiles(db: Session = Depends(get_db), user: User = Depends(current_user)):
    if not user.profile:
        return []
    profiles = db.query(Profile).filter(Profile.user_id != user.id).all()
    scored = [(profile, compatibility_score(user.profile, profile)) for profile in profiles]
    scored.sort(key=lambda item: item[1], reverse=True)
    return [profile_payload(profile, score) for profile, score in scored]


@router.post("/profiles")
def upsert_profile(payload: ProfileInput, db: Session = Depends(get_db), user: User = Depends(current_user)):
    profile = user.profile or Profile(user_id=user.id)
    profile.name = payload.name
    profile.bio = payload.bio
    profile.skills = payload.skills
    profile.industry = payload.industry
    profile.startup_idea = payload.startup_idea
    profile.looking_for = payload.looking_for
    profile.avatar_url = payload.avatar_url
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile_payload(profile)


@router.post("/swipe")
def swipe(payload: SwipeInput, db: Session = Depends(get_db), user: User = Depends(current_user)):
    if payload.target_user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot match yourself")
    target = db.query(User).filter(User.id == payload.target_user_id).first()
    if not target or not target.profile or not user.profile:
        raise HTTPException(status_code=404, detail="Target profile not found")
    user1_id, user2_id = sorted([user.id, target.id])
    match = db.query(Match).filter(Match.user1_id == user1_id, Match.user2_id == user2_id).first()
    if not payload.liked:
        if match:
            match.status = "passed"
            db.commit()
        return {"status": "passed"}
    score = compatibility_score(user.profile, target.profile)
    if not match:
        match = Match(user1_id=user1_id, user2_id=user2_id, status="matched", compatibility_score=score)
        db.add(match)
    else:
        match.status = "matched"
        match.compatibility_score = score
    db.commit()
    db.refresh(match)
    return {"status": match.status, "match_id": match.id, "compatibility_score": round(score, 2)}


@router.get("/matches")
def list_matches(db: Session = Depends(get_db), user: User = Depends(current_user)):
    matches = db.query(Match).filter(or_(Match.user1_id == user.id, Match.user2_id == user.id), Match.status == "matched").all()
    return [
        {
            "id": match.id,
            "other_user_id": match.user2_id if match.user1_id == user.id else match.user1_id,
            "status": match.status,
            "compatibility_score": match.compatibility_score,
            "created_at": match.created_at,
        }
        for match in matches
    ]


@router.get("/matches/{match_id}/messages")
def list_messages(match_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    match = db.query(Match).filter(Match.id == match_id, or_(Match.user1_id == user.id, Match.user2_id == user.id)).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    messages = db.query(Message).filter(Message.match_id == match_id).order_by(Message.created_at.asc()).all()
    return [{"id": message.id, "sender_id": message.sender_id, "content": message.content, "created_at": message.created_at} for message in messages]


@router.post("/matches/{match_id}/messages")
def send_message(match_id: int, payload: MessageInput, db: Session = Depends(get_db), user: User = Depends(current_user)):
    clean = payload.content.strip()
    if not clean:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    match = db.query(Match).filter(Match.id == match_id, or_(Match.user1_id == user.id, Match.user2_id == user.id), Match.status == "matched").first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    message = Message(match_id=match_id, sender_id=user.id, content=clean[:2000])
    db.add(message)
    db.commit()
    db.refresh(message)
    return {"id": message.id, "sender_id": message.sender_id, "content": message.content, "created_at": message.created_at}
