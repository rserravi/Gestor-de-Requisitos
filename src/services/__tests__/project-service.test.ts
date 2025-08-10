import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ProjectModel } from '../../models/project-model'

vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { api } from '../api'
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../project-service'

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('project-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listProjects calls GET /projects/ and returns projects', async () => {
    const projects: ProjectModel[] = [
      { id: 1, name: 'Project 1', description: 'Desc 1', owner_id: 1 },
    ]
    mockedApi.get.mockResolvedValue({ data: projects })

    const result = await listProjects()

    expect(mockedApi.get).toHaveBeenCalledWith('/projects/')
    expect(result).toEqual(projects)
  })

  it('createProject calls POST /projects/ with payload and returns project', async () => {
    const payload = { name: 'Project 1', description: 'Desc 1' }
    const project: ProjectModel = { id: 1, owner_id: 1, ...payload }
    mockedApi.post.mockResolvedValue({ data: project })

    const result = await createProject(payload)

    expect(mockedApi.post).toHaveBeenCalledWith('/projects/', payload)
    expect(result).toEqual(project)
  })

  it('getProject calls GET /projects/:id and returns project', async () => {
    const project: ProjectModel = {
      id: 1,
      name: 'Project 1',
      description: 'Desc 1',
      owner_id: 1,
    }
    mockedApi.get.mockResolvedValue({ data: project })

    const result = await getProject(1)

    expect(mockedApi.get).toHaveBeenCalledWith('/projects/1')
    expect(result).toEqual(project)
  })

  it('updateProject calls PUT /projects/:id with payload and returns project', async () => {
    const payload = { name: 'Updated', description: 'Updated desc' }
    const project: ProjectModel = { id: 1, owner_id: 1, ...payload }
    mockedApi.put.mockResolvedValue({ data: project })

    const result = await updateProject(1, payload)

    expect(mockedApi.put).toHaveBeenCalledWith('/projects/1', payload)
    expect(result).toEqual(project)
  })

  it('deleteProject calls DELETE /projects/:id', async () => {
    mockedApi.delete.mockResolvedValue(undefined)

    await expect(deleteProject(1)).resolves.toBeUndefined()
    expect(mockedApi.delete).toHaveBeenCalledWith('/projects/1')
  })
})

