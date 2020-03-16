const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeNotesArray } = require('./folders.fixtures')

describe('Folders Endpoints', function () {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())
    beforeEach('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE;'))
    afterEach('cleanup', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE;'))

    describe('GET /api/folders', () => {
        context('Given no folders', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })
        })

        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('responds with 200 and all of the articles', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders)
            })
        })
    })

    describe('GET /api/folders/:folderid', () => {
        context('Given no folders', () => {
            it('responds with 404', () => {
                const folderId = 12345
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(404, { error: { message: 'Folder does not exist' } })
            })
        })

        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray();

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('responds with 200 and the specified folder', () => {
                const folderId = 2
                const expectedFolder = testFolders[folderId - 1]
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(200, expectedFolder)
            })
        })
    })

    describe('POST /api/folders', () => {
        const testFolders = makeFoldersArray()

        before('insert folders', () => {
            return db
                .into('noteful_folders')
                .insert(testFolders)
        })

        it('creates a folder, responding with 201 and the new folder', () => {
            const newFolder = {
                name: 'my new Folder'
            }

            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newFolder.name)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/folder/${res.body.id}`)
                        .expect(res.body)
                })
        })

        const missingField = {
            id: 9,
            // name: null
        }
        it('responds with 400 and an error message when name is missing', () => {
            before('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(missingField)
            })

            return supertest(app)
                .post('/api/folders')
                .send(missingField)
                .expect(400, {
                    error: { message: 'Missing folder name in request body' }
                })
        })
    })

    describe('DELETE /api/folders/:folderid', () => {
        context('Given no folders', () => {
            it('responds with 404', () => {
                const folderId = 123456
                return supertest(app)
                    .delete(`/api/folders/${folderId}`)
                    .expect(404, { error: { message: 'Folder does not exist' } })
            })
        })

        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('responds with 204 and removes the folder', () => {
                const idToRemove = 2
                const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/folders/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get('/api/folders')
                            .expect(expectedFolders)
                    )

            })
        })
    })

    describe('PATCH /api/folders/:folderid', () => {
        context('Given no articles', () => {
            it('reponds with 404', () => {
                const folderId = 123456
                return supertest(app)
                    .delete(`/api/folders/${folderId}`)
                    .expect(404, { error: { message: 'Folder does not exist' } })
            })
        })
        context('Given there are folders', () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })
            it('respond 204 and updates the folder', () => {
                const idToUpdate = 2
                const updateFolder = {
                    name: 'updated folder name'
                }
                const expectedFolder = {
                    ...testFolders[idToUpdate - 1],
                    ...updateFolder
                }
                return supertest(app)
                    .patch(`/api/folders/${idToUpdate}`)
                    .send(updateFolder)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/folders/${idToUpdate}`)
                            .expect(expectedFolder)
                    )
            })
            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/folders/${idToUpdate}`)
                    .send({ irrelevantField: 'Foo' })
                    .expect(400, {
                        error: { message: `Request body must contain 'name'` }
                    })
            })
        })
    })
})

describe('Notes Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())
    beforeEach('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE;'))
    afterEach('cleanup', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE;'))

    describe('GET /api/notes', () => {
        context('Given no notes', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, [])
            })
        })

        context('Given there are notes in the database', () => {
            const testNotes = makeNotesArray()
            const testFolders = makeFoldersArray()

            before('insert folders, then notes', (done) => {
                db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        db
                            .into('noteful_notes')
                            .insert(testNotes)
                            .then(() => done())
                    })
            })
            it('responds with 200 and all the notes', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes)
            })
        })
    })

    describe('GET /api/:note_id', () => {
        context('Given no notes', () => {
            it('responds with 404', () => {
                const note_id = 1234
                return supertest(app)
                    .get(`/api/${note_id}`)
                    .expect(404)
            })
        })

        context('Given there are notes', () => {
            const testNotes = makeNotesArray()
            const testFolders = makeFoldersArray()

            before('insert folders, then notes', (done) => {
                db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        db
                            .into('noteful_notes')
                            .insert(testNotes)
                            .then(() => done())
                    })
            })
            it('responds with 200 and the note', () => {
                const noteId = 2
                const expectedNote = testNotes[noteId - 1]

                return supertest(app)
                    .get(`/api/${noteId}`)
                    .expect(200, expectedNote)
            })

        })
    })
    describe('POST /api/notes', () => {
        const testNotes = makeNotesArray()
        const testFolders = makeFoldersArray()

        before('insert folders, then notes', (done) => {
            db
                .into('noteful_folders')
                .insert(testFolders)
                .then(() => {
                    db
                        .into('noteful_notes')
                        .insert(testNotes)
                        .then(() => done())
                })
        })
        it('Creates a note, responding with 201 and the new note', () => {
            const newNote = {
                name: 'post method note',
                content: 'post note content',
                folderid: 1
            }

            return supertest(app)
                .post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newNote.name)
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body.folderId).to.eql(newNote.folderId)
                })
                .then(res =>
                    supertest(app)
                        .get(`/api/notes/${res.body.id}`)
                        .expect(res.body)
                )
        })
    })

    describe('DELETE /api/:note_id', () => {
        context('Given no notes', () => {
            it('responds with 404', () => {
                const noteId = 12345
                return supertest(app)
                    .delete(`/api/${noteId}`)
                    .expect(404, {
                        error: {
                            message: 'Note does not exist'
                        }
                    })
            })

        })
    })
})