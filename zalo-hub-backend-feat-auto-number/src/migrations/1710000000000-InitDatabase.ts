import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NULL,
        userZaloId VARCHAR(255) NOT NULL,
        accountStatus INT,
        avatar VARCHAR(255),
        bgavatar VARCHAR(255),
        bizPkg JSON,
        cover VARCHAR(255),
        createdTs BIGINT,
        displayName VARCHAR(255),
        dob BIGINT,
        gender INT,
        globalId VARCHAR(255),
        isActive INT,
        isActivePC INT,
        isActiveWeb INT,
        isBlocked INT,
        isFr INT,
        isValid INT,
        accountKey INT,
        lastActionTime BIGINT,
        lastUpdateTime BIGINT,
        oaInfo JSON,
        oa_status JSON,
        phoneNumber VARCHAR(50),
        sdob VARCHAR(50),
        status VARCHAR(50),
        type INT,
        userKey VARCHAR(255),
        user_mode INT,
        username VARCHAR(255),
        zaloName VARCHAR(255),
        isConnect INT DEFAULT 0,
        imei VARCHAR(255),
        cookies JSON,
        userAgent VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE friends (
        id INT AUTO_INCREMENT PRIMARY KEY,
        accountId INT NOT NULL,
        userId VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        displayName VARCHAR(255),
        zaloName VARCHAR(255),
        avatar VARCHAR(255),
        bgavatar VARCHAR(255),
        cover VARCHAR(255),
        gender INT,
        dob INT,
        sdob VARCHAR(255),
        status VARCHAR(255),
        phoneNumber VARCHAR(255),
        isFr TINYINT DEFAULT 0,
        isBlocked TINYINT DEFAULT 0,
        lastActionTime BIGINT,
        lastUpdateTime BIGINT,
        isActive TINYINT DEFAULT 0,
        friendKey BIGINT,
        type INT DEFAULT 0,
        isActivePC TINYINT DEFAULT 0,
        isActiveWeb TINYINT DEFAULT 0,
        isValid TINYINT DEFAULT 0,
        userKey VARCHAR(255),
        accountStatus INT DEFAULT 0,
        oaInfo JSON,
        user_mode INT DEFAULT 0,
        globalId VARCHAR(255),
        bizPkg JSON,
        createdTs BIGINT DEFAULT 0,
        oa_status JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_friends_account FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE

      )
    `);

    await queryRunner.query(`
      CREATE TABLE conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        account_id INT NOT NULL,
        friend_id INT NOT NULL,
        userZaloId VARCHAR(255) NOT NULL,
        userKey VARCHAR(255) NOT NULL,
        is_pinned INT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_conversations_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        CONSTRAINT FK_conversations_friend FOREIGN KEY (friend_id) REFERENCES friends(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type INT NOT NULL,
        thread_id VARCHAR(255) NOT NULL,
        is_self INT NOT NULL,
        action_id VARCHAR(255) NOT NULL,
        msg_id VARCHAR(255) NOT NULL,
        cli_msg_id VARCHAR(255) NOT NULL,
        uid_from VARCHAR(255) NOT NULL,
        id_to VARCHAR(255) NOT NULL,
        d_name VARCHAR(255) NOT NULL,
        ts VARCHAR(255) NOT NULL,
        status INT NOT NULL,
        content TEXT NOT NULL,
        title TEXT,
        description TEXT,
        href TEXT,
        thumb TEXT,
        childnumber INT,
        action TEXT,
        params TEXT,
        conversation_id INT NOT NULL,
        message_status ENUM('sending', 'sent', 'failed'),
        sender_id INT,
        is_read INT DEFAULT 0,
        msg_type VARCHAR(255),
        cmd INT,
        st INT,
        at INT,
        stickerId INT,
        cateId INT,
        stickerType INT,
        stickerUrl VARCHAR(255),
        stickerSpriteUrl VARCHAR(255),
        stickerWebpUrl VARCHAR(255),
        stickerTotalFrames INT,
        stickerDuration INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        CONSTRAINT FK_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE reactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action_id VARCHAR(255) NOT NULL,
        msg_id VARCHAR(255) NOT NULL,
        message_id INT NOT NULL,
        cli_msg_id VARCHAR(255) NOT NULL,
        msg_type VARCHAR(255),
        uid_from VARCHAR(255) NOT NULL,
        id_to VARCHAR(255) NOT NULL,
        ts VARCHAR(255) NOT NULL,
        r_icon VARCHAR(255) NOT NULL,
        msg_sender VARCHAR(255) NOT NULL,
        r_type INT NOT NULL,
        source INT,
        ttl INT,
        thread_id VARCHAR(255) NOT NULL,
        is_self INT NOT NULL,
        r_msg JSON,
        g_msg_id VARCHAR(255),
        c_msg_id VARCHAR(255),
        d_name VARCHAR(255),
        is_read INT DEFAULT 0,
        conversation_id INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT FK_reactions_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
        CONSTRAINT FK_reactions_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE stickers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        stickerId INT NOT NULL,
        cateId INT NOT NULL,
        type INT NOT NULL,
        stickerUrl VARCHAR(255) NOT NULL,
        stickerSpriteUrl VARCHAR(255) NOT NULL,
        totalFrames INT NOT NULL,
        duration INT NOT NULL,
        stickerWebpUrl VARCHAR(255)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reactions`);
    await queryRunner.query(`DROP TABLE IF EXISTS messages`);
    await queryRunner.query(`DROP TABLE IF EXISTS conversations`);
    await queryRunner.query(`DROP TABLE IF EXISTS friends`);
    await queryRunner.query(`DROP TABLE IF EXISTS accounts`);
    await queryRunner.query(`DROP TABLE IF EXISTS stickers`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
