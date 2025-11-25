'use client'

import React, { useState } from 'react';
import { mockSkills, type Job, type Skill, JobStatus } from './types';

interface JobFormProps {
  onSubmit: (data: any) => void;
  initialData?: Job | null;
  isEdit?: boolean;
}

function normalizeSkillName(name: string) {
  return name.trim().toLowerCase();
}

function dedupeSkillsByName(skills: Skill[] = []) {
  const seen = new Set<string>();
  return skills.filter((skill) => {
    const key = normalizeSkillName(skill.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ensureSkillId(skill: Skill) {
  if (skill.id) return skill;
  return { ...skill, id: `skill-${normalizeSkillName(skill.name)}` };
}

export function JobForm({ onSubmit, initialData, isEdit = false }: JobFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || JobStatus.Draft,
    positions: initialData?.positions || 1,
    skills: dedupeSkillsByName(initialData?.skills).map(ensureSkillId),
  });

  const canEditDetails = !isEdit || initialData?.status === JobStatus.Draft;
  const [availableSkills] = useState(mockSkills);
  const [newSkill, setNewSkill] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: Skill) => {
    const candidateName = normalizeSkillName(skill.name);
    if (!formData.skills.find(s => normalizeSkillName(s.name) === candidateName)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, ensureSkillId(skill)]
      }));
    }
  };

  const removeSkill = (skillId: string, skillName: string) => {
    const nameKey = normalizeSkillName(skillName);
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(
        s => s.id !== skillId && normalizeSkillName(s.name) !== nameKey
      )
    }));
  };

  const addCustomSkill = () => {
    const trimmed = newSkill.trim();
    const normalized = normalizeSkillName(trimmed);
    if (
      trimmed &&
      !formData.skills.find((s) => normalizeSkillName(s.name) === normalized)
    ) {
      const customSkill: Skill = {
        id: `custom-${Date.now()}`,
        name: trimmed
      };
      addSkill(customSkill);
      setNewSkill('');
    }
  };

  const filteredSkills = availableSkills.filter((skill) => {
    const candidateName = normalizeSkillName(skill.name);
    return !formData.skills.some((s) => normalizeSkillName(s.name) === candidateName);
  });

  return (
    <main className="flex w-full max-w-3xl flex-col items-center justify-center px-6 py-24 sm:px-16 sm:py-32">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-100 dark:border-zinc-800">
        <h1 className="text-3xl font-semibold mb-6 text-black dark:text-zinc-50 text-center">
          {isEdit ? 'Edit Job Posting' : 'Create New Job'}
        </h1>
        {isEdit && !canEditDetails && (
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
            This job is no longer a Draft. You can update its status, but other fields are locked to keep posted details consistent.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200">
                Job Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={!canEditDetails}
                className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </div>
            <div>
              <label htmlFor="positions" className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200">
                Number of Positions
              </label>
              <input
                id="positions"
                type="number"
                min="1"
                value={formData.positions}
                onChange={(e) => handleChange('positions', parseInt(e.target.value))}
                disabled={!canEditDetails}
                className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                placeholder="Number of open positions"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            >
              {Object.values(JobStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block mb-2 font-medium text-zinc-800 dark:text-zinc-200">
              Job Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={!canEditDetails}
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="block font-medium text-zinc-800 dark:text-zinc-200">
              Required Skills
            </label>
            
            {/* Selected Skills */}
            {formData.skills.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Selected skills:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span 
                      key={skill.id} 
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    >
                      {skill.name}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id, skill.name)}
                        disabled={!canEditDetails}
                        className="ml-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add Skills */}
            <div className="space-y-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Add skills from our list:</p>
              <div className="flex flex-wrap gap-2">
                {filteredSkills.slice(0, 10).map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => addSkill(skill)}
                    disabled={!canEditDetails}
                    className="px-3 py-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    + {skill.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="space-y-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Or add a custom skill:</p>
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  disabled={!canEditDetails}
                  className="flex-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  placeholder="Enter skill name"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  disabled={!newSkill.trim() || !canEditDetails}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition ${
                    !newSkill.trim() || !canEditDetails
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            {isEdit ? 'Update Job' : 'Create Job'}
          </button>
        </form>
      </div>
    </main>
  );
}