import mongoose from "mongoose";

const ProgressSchema = mongoose.Schema({
  student: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
  course: {
    type: mongoose.Types.ObjectId,
    ref: "courses",
    required: true,
  },
  // Keeping original fields
  completedLessons: {
    type: [String],
    default: [],
  },
  completedAssignments: {
    type: [mongoose.Types.ObjectId],
    ref: "assignments",
    default: [],
  },
  completedQuizzes: {
    type: [{ quizId: mongoose.Types.ObjectId, score: Number }],
    default: [],
  },
  
  moduleProgress: [
    {
      moduleId: {
        type: mongoose.Types.ObjectId,
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      completedContents: [mongoose.Types.ObjectId],
      quizAttempts: [
        {
          date: {
            type: Date,
            default: Date.now,
          },
          score: Number,
          answers: [
            {
              questionId: mongoose.Types.ObjectId,
              selectedOption: String,
              correct: Boolean,
              conceptTags: [String], // Which concepts this question tested
            },
          ],
        },
      ],
      lastQuizScore: {
        type: Number,
        default: 0,
      },
    },
  ],

  // Track personalized skills/concepts mastery
  conceptMastery: [
    {
      conceptTag: {
        type: String,
        required: true,
      },
      masteryLevel: {
        type: Number,
        default: 0, // 0-10 scale
      },
      confidenceScore: {
        type: Number,
        default: 0, // 0-10 scale, how confident we are in this assessment
      },
      needsReview: {
        type: Boolean,
        default: false,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  
  // Store the personalized roadmap for this student
  personalizedRoadmap: [
    {
      moduleId: {
        type: mongoose.Types.ObjectId,
        required: true,
      },
      recommendedContentIds: [mongoose.Types.ObjectId],
      additionalResources: [
        {
          title: String,
          description: String,
          url: String,
          type: {
            type: String,
            enum: ["video", "reading", "practice", "other"],
          },
          conceptTags: [String],
          priority: {
            type: Number,
            default: 1, // 1-5 scale
          },
        },
      ],
      priority: {
        type: Number,
        default: 1, // 1-5 scale, 5 being highest priority
      },
      reason: {
        type: String,
        default: "", // Explanation for why this is recommended
      },
    },
  ],
  
  // Overall progress percentage
  overallProgress: {
    type: Number,
    default: 0, // 0-100 percentage
  },
  
  // When did they last engage with the course
  lastActive: {
    type: Date,
    default: Date.now,
  },
  
  // How many consecutive days they've been active (streak)
  streak: {
    type: Number,
    default: 0,
  },
});

export const ProgressModel = mongoose.model("progress", ProgressSchema);
