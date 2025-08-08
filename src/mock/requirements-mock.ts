import type { RequirementModel } from "../models/requirements-model";

export const requirementsMock: RequirementModel[] = [
    {
        id: '1',
        number: 1,
        description: 'User must be able to login with email and password',
        status: 'draft',
        category: 'functional',
        priority: 'must',
        visualReference: 'https://example.com/login.png',
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 1
    },
    {
        id: '2',
        number: 2,
        description: 'System should respond within 2 seconds for all operations',
        status: 'in-review',
        category: 'performance',
        priority: 'should',
        visualReference: 'https://example.com/performance.png',
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 1
    },
    {
        id: '3',
        number: 3,
        description: 'Interface must be accessible on mobile devices',
        status: 'approved',
        category: 'usability',
        priority: 'must',
        visualReference: 'https://example.com/mobile.png',
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: 1
    }
]
