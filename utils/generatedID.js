function generateIdNotes(notes){
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0; //logic of our ID generator
    return maxId + 1;
};


export default {
    generateIdNotes,
}