function makeFoldersArray() {
    return [
        {
            id: 1,
            name: 'My folder'
        },
        {
            id: 2,
            name: 'Test folder'
        },
        {
            id: 3,
            name: 'New test folder'
        },
        {
            id: 4,
            name: 'another test folder'
        },
    ];
}

function makeNotesArray() {
    return [
        {
            id: 1,
            name: 'test note 1',
            modified: new Date(),
            content: 'test note content',
            folderid: 1
        },
        {
            id: 2,
            name: 'test note 2',
            modified: new Date(),
            content: 'test note content',
            folderid: 2
        },
        {
            id: 3,
            name: 'test note 3',
            modified: new Date(),
            content: 'test note content',
            folderid: 3
        },
        {
            id: 4,
            name: 'test note 4',
            modified: new Date(),
            content: 'test note content',
            folderid: 4
        }
    ]
}

module.exports = {
    makeFoldersArray, makeNotesArray
}
