from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import json


class JsonListMixin:
    @staticmethod
    def encode_list(values):
        return json.dumps(values or [])

    @staticmethod
    def decode_list(value):
        if not value:
            return []
        return json.loads(value)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    google_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Profile(Base, JsonListMixin):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(120), nullable=False)
    bio = Column(Text, nullable=False, default="")
    skills_json = Column(Text, nullable=False, default="[]")
    industry = Column(String(120), nullable=False)
    startup_idea = Column(Text, nullable=False)
    looking_for_json = Column(Text, nullable=False, default="[]")
    avatar_url = Column(String(500), nullable=True)

    user = relationship("User", back_populates="profile")

    @property
    def skills(self):
        return self.decode_list(self.skills_json)

    @skills.setter
    def skills(self, values):
        self.skills_json = self.encode_list(values)

    @property
    def looking_for(self):
        return self.decode_list(self.looking_for_json)

    @looking_for.setter
    def looking_for(self, values):
        self.looking_for_json = self.encode_list(values)


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("user1_id", "user2_id", name="unique_match_pair"),)

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(40), nullable=False, default="pending")
    compatibility_score = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
