import {
  addNote,
  findAll,
  findById,
  objectRefs,
  observableRefs,
  relationRefs,
  notesDistributionByEntity,
  notesNumber,
  notesNumberByEntity,
  notesTimeSeries,
  notesTimeSeriesByAuthor,
  notesTimeSeriesByEntity,
  noteContainsStixDomainEntity,
  noteContainsStixRelation,
  noteContainsStixObservable,
} from '../domain/note';
import {
  stixDomainEntityAddRelation,
  stixDomainEntityCleanContext,
  stixDomainEntityDelete,
  stixDomainEntityDeleteRelation,
  stixDomainEntityEditContext,
  stixDomainEntityEditField,
} from '../domain/stixDomainObject';
import { REL_INDEX_PREFIX } from '../database/elasticSearch';
import {
  RELATION_CREATED_BY,
  RELATION_OBJECT_LABEL,
  RELATION_OBJECT,
  RELATION_OBJECT_MARKING,
} from '../utils/idGenerator';

const noteResolvers = {
  Query: {
    note: (_, { id }) => findById(id),
    notes: (_, args) => findAll(args),
    notesTimeSeries: (_, args) => {
      if (args.objectId && args.objectId.length > 0) {
        return notesTimeSeriesByEntity(args);
      }
      if (args.authorId && args.authorId.length > 0) {
        return notesTimeSeriesByAuthor(args);
      }
      return notesTimeSeries(args);
    },
    notesNumber: (_, args) => {
      if (args.objectId && args.objectId.length > 0) {
        return notesNumberByEntity(args);
      }
      return notesNumber(args);
    },
    notesDistribution: (_, args) => {
      if (args.objectId && args.objectId.length > 0) {
        return notesDistributionByEntity(args);
      }
      return [];
    },
    noteContainsStixDomainEntity: (_, args) => {
      return noteContainsStixDomainEntity(args.id, args.objectId);
    },
    noteContainsStixRelation: (_, args) => {
      return noteContainsStixRelation(args.id, args.objectId);
    },
    noteContainsStixObservable: (_, args) => {
      return noteContainsStixObservable(args.id, args.objectId);
    },
  },
  NotesOrdering: {
    markingDefinitions: `${REL_INDEX_PREFIX}${RELATION_OBJECT_MARKING}.definition`,
    labels: `${REL_INDEX_PREFIX}${RELATION_OBJECT_LABEL}.value`,
    createdBy: `${REL_INDEX_PREFIX}${RELATION_CREATED_BY}.name`,
  },
  NotesFilter: {
    labels: `${REL_INDEX_PREFIX}${RELATION_OBJECT_LABEL}.internal_id`,
    createdBy: `${REL_INDEX_PREFIX}${RELATION_CREATED_BY}.internal_id`,
    markingDefinitions: `${REL_INDEX_PREFIX}${RELATION_OBJECT_MARKING}.internal_id`,
    knowledgeContains: `${REL_INDEX_PREFIX}${RELATION_OBJECT}.internal_id`,
    observablesContains: `${REL_INDEX_PREFIX}observable_refs.internal_id`,
  },
  Note: {
    objectRefs: (note, args) => objectRefs(note.id, args),
    observableRefs: (note, args) => observableRefs(note.id, args),
    relationRefs: (note, args) => relationRefs(note.id, args),
  },
  Mutation: {
    noteEdit: (_, { id }, { user }) => ({
      delete: () => stixDomainEntityDelete(user, id),
      fieldPatch: ({ input }) => stixDomainEntityEditField(user, id, input),
      contextPatch: ({ input }) => stixDomainEntityEditContext(user, id, input),
      contextClean: () => stixDomainEntityCleanContext(user, id),
      relationAdd: ({ input }) => stixDomainEntityAddRelation(user, id, input),
      relationDelete: ({ relationId, toId, relationType }) =>
        stixDomainEntityDeleteRelation(user, id, relationId, toId, relationType),
    }),
    noteAdd: (_, { input }, { user }) => addNote(user, input),
  },
};

export default noteResolvers;
