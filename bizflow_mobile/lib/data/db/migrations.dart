// Migration file for future database schema updates
// Currently using schema version 1, no migrations needed yet

// Example for future migrations:
// 
// @DriftDatabase(tables: [...], version: 2)
// class AppDb extends _$AppDb {
//   @override
//   int get schemaVersion => 2;
//   
//   @override
//   MigrationStrategy get migration {
//     return MigrationStrategy(
//       onCreate: (Migrator m) async {
//         await m.createAll();
//       },
//       onUpgrade: (Migrator m, int from, int to) async {
//         if (from == 1) {
//           // Migration from version 1 to 2
//           // await m.addColumn(users, users.newColumn);
//         }
//       },
//     );
//   }
// }
