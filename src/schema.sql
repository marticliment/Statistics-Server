CREATE TABLE Users (
	Identifier INTEGER NOT NULL,
	LastConnection INTEGER NOT NULL,
	ClientVersion INTEGER NOT NULL,
	ActiveSettings INTEGER NOT NULL,
	ActiveManagers INTEGER NOT NULL, "Language" TEXT,
	CONSTRAINT Users_PK PRIMARY KEY (Identifier)
);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE RawCounters (
	"Key" TEXT NOT NULL,
	SubKey TEXT,
	Value NUMERIC DEFAULT (0) NOT NULL,
	CONSTRAINT RawCounters_PK PRIMARY KEY ("Key",SubKey)
);
CREATE TABLE Operations (
	PackageId TEXT NOT NULL,
	PackageSource TEXT,
	PackageManager TEXT NOT NULL,
	OperationType INTEGER NOT NULL,
	OperationResult INTEGER NOT NULL,
	ClientVersion TEXT NOT NULL,
	OperationReferral TEXT,
	EventCount INTEGER NOT NULL,
	CONSTRAINT Operations_PK PRIMARY KEY (PackageId,PackageSource,PackageManager,OperationType,OperationResult,ClientVersion,OperationReferral)
);
