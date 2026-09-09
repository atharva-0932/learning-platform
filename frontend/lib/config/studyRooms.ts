/**
 * Virtual Study Rooms — Frame (framevr.io) embed targets.
 *
 * Frame space names → SkillCrew slugs:
 *   atharva   → study-hall
 *   milestone → milestone
 *   reviewer  → review
 */

export type StudyRoomSlug = 'study-hall' | 'milestone' | 'review'

export type StudyRoomConfig = {
  frameUrl: string
  title: string
  description: string
}

export const DEFAULT_STUDY_ROOM: StudyRoomSlug = 'study-hall'

export const STUDY_ROOMS: Record<StudyRoomSlug, StudyRoomConfig> = {
  'study-hall': {
    // Frame space name: atharva
    frameUrl: 'https://framevr.io/atharva',
    title: 'Study Hall',
    description: 'Open co-working space for focused sessions with your cohort.',
  },
  milestone: {
    frameUrl: 'https://framevr.io/milestone',
    title: 'Milestone Room',
    description: 'Gather around the current roadmap milestone and related materials.',
  },
  review: {
    // Frame space name: reviewer
    frameUrl: 'https://framevr.io/reviewer',
    title: 'Review Room',
    description: 'Quiet space for revisiting weak topics and quiz prep.',
  },
}

export const STUDY_ROOM_SLUGS = Object.keys(STUDY_ROOMS) as StudyRoomSlug[]

export function resolveStudyRoom(slug: string | null | undefined): {
  slug: StudyRoomSlug
  room: StudyRoomConfig
} {
  if (slug && slug in STUDY_ROOMS) {
    const known = slug as StudyRoomSlug
    return { slug: known, room: STUDY_ROOMS[known] }
  }
  return { slug: DEFAULT_STUDY_ROOM, room: STUDY_ROOMS[DEFAULT_STUDY_ROOM] }
}
