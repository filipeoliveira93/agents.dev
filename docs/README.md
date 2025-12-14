# Agent Workflow Guide

This document outlines the standard development flow using the installed Agents.

## 1. Project Specification (@Project Architect)
**Action:** Describe your project idea.
- Command: `/dev:project "I want a Todo App that..."`
- Output: `docs/project.md`

## 2. Requirements Definition (@Requirements Engineer)
**Action:** Define technical requirements and stack based on the project spec.
- Command: `/dev:requirements`
- Output: `docs/requirements.md`

## 3. roadmap Strategy (@Milestone Manager)
**Action:** Break down the project into logical milestones, following the requirements.
- Command: `/dev:milestone`
- Output: `docs/milestones.md`

## 4. Task Breakdown (@Task Planner)
**Action:** Break down a specific milestone into small, executable tasks.
- Command: `/dev:tasks <Milestone_ID>`
- Output: `docs/task.md`

## 5. Implementation (@Coder)
**Action:** Execute a specific task.
- Command: `/dev:coder <Task_ID>`
- Buffer: `work_log.md`

## 6. Code Review (@QA Engineer)
**Action:** Verify if the task was executed correctly against requirements.
- Command: `/dev:review <Task_ID>`
- Output: `docs/logs/review_log.md`

## 7. Change Logging (@Release Manager)
**Action:** Consolidate the work log into a report of what was done.
- Command: `/dev:log`
- Output: `changelog.md`
