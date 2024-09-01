from sqlmodel import create_engine


class DB:
    def __init__(self):
        self.sqlite_file_name = "alexandria.db"
        self.sqlite_url = f"sqlite:///{self.sqlite_file_name}"
        self.connect_args = {"check_same_thread": False}
        self.engine = create_engine(
            self.sqlite_url, echo=True, connect_args=self.connect_args
        )

    def get_engine(self):
        return self.engine

    def execute(self):
        pass

    def close(self):
        pass


def get_db():
    db = DB()
    try:
        yield db
    finally:
        db.close()
