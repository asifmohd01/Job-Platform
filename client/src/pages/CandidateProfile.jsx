import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { candidateProfileAPI } from "../services/apiClient";
import ProfileSummary from "../components/ProfileSections/ProfileSummary";
import ResumeSection from "../components/ProfileSections/ResumeSection";
import WorkExperience from "../components/ProfileSections/WorkExperience";
import SkillsSection from "../components/ProfileSections/SkillsSection";
import EducationSection from "../components/ProfileSections/EducationSection";
import JobPreferences from "../components/ProfileSections/JobPreferences";
import PersonalDetails from "../components/ProfileSections/PersonalDetails";
import Certifications from "../components/ProfileSections/Certifications";
import Projects from "../components/ProfileSections/Projects";
import Awards from "../components/ProfileSections/Awards";
import SocialLinks from "../components/ProfileSections/SocialLinks";
import Languages from "../components/ProfileSections/Languages";

const CandidateProfile = () => {
  const { candidateId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        let response;

        if (candidateId) {
          // Viewing someone else's profile
          response = await candidateProfileAPI.getCandidateProfile(candidateId);
          setIsOwnProfile(false);
        } else {
          // Viewing own profile
          response = await candidateProfileAPI.getMyProfile();
          setIsOwnProfile(true);
        }

        setProfile(response.data.profile || {});
        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [candidateId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-red-300 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {isOwnProfile ? "My Profile" : "Candidate Profile"}
          </h1>
          <p className="text-gray-400 mt-2">
            {isOwnProfile
              ? "Build your professional profile to showcase your skills and experience"
              : "View candidate's profile"}
          </p>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {/* 1. Profile Summary */}
          {(profile.summary || isOwnProfile) && (
            <ProfileSummary
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 2. Resume */}
          {(profile.resume || isOwnProfile) && (
            <ResumeSection
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
              candidateId={isOwnProfile ? user?._id : candidateId}
            />
          )}

          {/* 3. Work Experience */}
          {(profile.workExperience?.length > 0 || isOwnProfile) && (
            <WorkExperience
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 4. Skills */}
          {(profile.skills?.length > 0 || isOwnProfile) && (
            <SkillsSection
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 5. Education */}
          {(profile.education?.length > 0 || isOwnProfile) && (
            <EducationSection
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 6. Job Preferences */}
          {(profile.jobPreferences?.preferredJobTitles?.length > 0 ||
            profile.jobPreferences?.preferredLocations?.length > 0 ||
            isOwnProfile) && (
            <JobPreferences
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 7. Personal Details */}
          {(profile.personalDetails?.country ||
            profile.personalDetails?.nationality ||
            isOwnProfile) && (
            <PersonalDetails
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 8. Certifications */}
          {(profile.certifications?.length > 0 || isOwnProfile) && (
            <Certifications
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 9. Projects */}
          {(profile.projects?.length > 0 || isOwnProfile) && (
            <Projects
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 10. Awards */}
          {(profile.awards?.length > 0 || isOwnProfile) && (
            <Awards
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 11. Social Links */}
          {(profile.socialLinks?.linkedin ||
            profile.socialLinks?.github ||
            profile.socialLinks?.portfolio ||
            isOwnProfile) && (
            <SocialLinks
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}

          {/* 12. Languages */}
          {(profile.languages?.length > 0 || isOwnProfile) && (
            <Languages
              profile={profile}
              setProfile={setProfile}
              isOwnProfile={isOwnProfile}
            />
          )}
        </div>

        {/* Empty State for Own Profile */}
        {isOwnProfile && Object.keys(profile).length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              Start building your profile by adding sections above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;
