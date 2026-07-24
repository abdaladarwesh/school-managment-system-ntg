-- 1. Recreate the Audit Table clean
-- DROP TABLE AUDIT_LOGS;

CREATE TABLE AUDIT_LOGS
(
    AUDIT_ID         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    TABLE_NAME       VARCHAR2(50) NOT NULL,
    RECORD_ID        NUMBER       NOT NULL,
    ACTION           VARCHAR2(10) NOT NULL,
    OLD_VALUE        CLOB,
    NEW_VALUE        CLOB,
    CHANGED_BY       VARCHAR2(100),
    EDITED_USER_NAME VARCHAR2(300), -- NEW: The actual name of the user being edited
    CHANGED_FIELDS   CLOB,          -- NEW: A list of fields that were updated
    CHANGED_AT       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENT Triggers
CREATE OR REPLACE TRIGGER student_trigger_insert
    AFTER INSERT ON STUDENT
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_new_json         CLOB;
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);

    -- Fetch the user's name based on USER_ID
    BEGIN
        SELECT FIRST_NAME || ' ' || LAST_NAME INTO v_edited_user_name
        FROM USERS WHERE USER_ID = :NEW.USER_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    v_new_json := '{' ||
                  '"student_id": ' || :NEW.STUDENT_ID || ',' ||
                  '"user_id": ' || :NEW.USER_ID || ',' ||
                  '"academic_score": ' || NVL(TO_CHAR(:NEW.ACADEMIC_SCORE_IN_MIDDLE_SCHOOL), 'null') || ',' ||
                  '"class_id": ' || NVL(TO_CHAR(:NEW.CLASS_ID), 'null') || ',' ||
                  '"program_id": ' || NVL(TO_CHAR(:NEW.PROGRAM_ID), 'null') || ',' ||
                  '"governorate": "' || NVL(:NEW.GOVERNORATE, 'N/A') || '",' ||
                  '"place_of_birth": "' || NVL(:NEW.PLACE_OF_BIRTH, 'N/A') || '",' ||
                  '"martial_parent_status": "' || :NEW.MARTIAL_PARENT_STATUS || '"' ||
                  '}';

    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME)
    VALUES ('STUDENT', :NEW.STUDENT_ID, 'INSERT', NULL, v_new_json, v_app_user, v_edited_user_name);
END;
/

CREATE OR REPLACE TRIGGER student_trigger_update
    AFTER UPDATE ON STUDENT
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_old_json         CLOB;
    v_new_json         CLOB;
    v_changed_fields   CLOB := '';
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);

    -- Fetch the user's name
    BEGIN
        SELECT FIRST_NAME || ' ' || LAST_NAME INTO v_edited_user_name
        FROM USERS WHERE USER_ID = :NEW.USER_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    -- Track which fields changed
    IF NVL(TO_CHAR(:NEW.ACADEMIC_SCORE_IN_MIDDLE_SCHOOL), '#') <> NVL(TO_CHAR(:OLD.ACADEMIC_SCORE_IN_MIDDLE_SCHOOL), '#') THEN v_changed_fields := v_changed_fields || 'ACADEMIC_SCORE, '; END IF;
    IF NVL(TO_CHAR(:NEW.CLASS_ID), '#') <> NVL(TO_CHAR(:OLD.CLASS_ID), '#') THEN v_changed_fields := v_changed_fields || 'CLASS_ID, '; END IF;
    IF NVL(TO_CHAR(:NEW.PROGRAM_ID), '#') <> NVL(TO_CHAR(:OLD.PROGRAM_ID), '#') THEN v_changed_fields := v_changed_fields || 'PROGRAM_ID, '; END IF;
    IF NVL(TO_CHAR(:NEW.GOVERNORATE), '#') <> NVL(TO_CHAR(:OLD.GOVERNORATE), '#') THEN v_changed_fields := v_changed_fields || 'GOVERNORATE, '; END IF;
    IF NVL(TO_CHAR(:NEW.PLACE_OF_BIRTH), '#') <> NVL(TO_CHAR(:OLD.PLACE_OF_BIRTH), '#') THEN v_changed_fields := v_changed_fields || 'PLACE_OF_BIRTH, '; END IF;
    IF NVL(TO_CHAR(:NEW.MARTIAL_PARENT_STATUS), '#') <> NVL(TO_CHAR(:OLD.MARTIAL_PARENT_STATUS), '#') THEN v_changed_fields := v_changed_fields || 'MARTIAL_PARENT_STATUS, '; END IF;

    v_changed_fields := RTRIM(v_changed_fields, ', ');

    -- Build JSONs
    v_old_json := '{' || '"student_id": ' || :OLD.STUDENT_ID || ',' || '"user_id": ' || :OLD.USER_ID || ',' || '"academic_score": ' || NVL(TO_CHAR(:OLD.ACADEMIC_SCORE_IN_MIDDLE_SCHOOL), 'null') || ',' || '"class_id": ' || NVL(TO_CHAR(:OLD.CLASS_ID), 'null') || ',' || '"program_id": ' || NVL(TO_CHAR(:OLD.PROGRAM_ID), 'null') || ',' || '"governorate": "' || NVL(:OLD.GOVERNORATE, 'N/A') || '",' || '"place_of_birth": "' || NVL(:OLD.PLACE_OF_BIRTH, 'N/A') || '",' || '"martial_parent_status": "' || :OLD.MARTIAL_PARENT_STATUS || '"' || '}';
    v_new_json := '{' || '"student_id": ' || :NEW.STUDENT_ID || ',' || '"user_id": ' || :NEW.USER_ID || ',' || '"academic_score": ' || NVL(TO_CHAR(:NEW.ACADEMIC_SCORE_IN_MIDDLE_SCHOOL), 'null') || ',' || '"class_id": ' || NVL(TO_CHAR(:NEW.CLASS_ID), 'null') || ',' || '"program_id": ' || NVL(TO_CHAR(:NEW.PROGRAM_ID), 'null') || ',' || '"governorate": "' || NVL(:NEW.GOVERNORATE, 'N/A') || '",' || '"place_of_birth": "' || NVL(:NEW.PLACE_OF_BIRTH, 'N/A') || '",' || '"martial_parent_status": "' || :NEW.MARTIAL_PARENT_STATUS || '"' || '}';

    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME, CHANGED_FIELDS)
    VALUES ('STUDENT', :NEW.STUDENT_ID, 'UPDATE', v_old_json, v_new_json, v_app_user, v_edited_user_name, v_changed_fields);
END;
/


-- 3. USERS Triggers
CREATE OR REPLACE TRIGGER user_trigger_insert
    AFTER INSERT ON USERS
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_new_json         CLOB;
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);
    v_edited_user_name := :NEW.FIRST_NAME || ' ' || :NEW.LAST_NAME;

    v_new_json := '{' || '"user_id": ' || :NEW.USER_ID || ',' || '"email": "' || :NEW.EMAIL || '",' || '"first_name": "' || :NEW.FIRST_NAME || '",' || '"last_name": "' || :NEW.LAST_NAME || '",' || '"role_id": ' || :NEW.ROLE_ID || ',' || '"gender": "' || :NEW.GENDER || '",' || '"national_number": ' || NVL(TO_CHAR(:NEW.NATIONAL_NUMBER), 'null') || ',' || '"birth_date": "' || NVL(TO_CHAR(:NEW.BIRTH_DATE, 'YYYY-MM-DD'), 'N/A') || '",' || '"is_deleted": ' || NVL(TO_CHAR(:NEW.ISDELETED), '0') || '}';

    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME)
    VALUES ('USERS', :NEW.USER_ID, 'INSERT', NULL, v_new_json, v_app_user, v_edited_user_name);
END;
/

CREATE OR REPLACE TRIGGER user_trigger_update
    AFTER UPDATE ON USERS
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_action           VARCHAR2(10);
    v_old_json         CLOB;
    v_new_json         CLOB;
    v_changed_fields   CLOB := '';
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);
    v_edited_user_name := :NEW.FIRST_NAME || ' ' || :NEW.LAST_NAME;

    IF :NEW.ISDELETED = 1 AND ( :OLD.ISDELETED IS NULL OR :OLD.ISDELETED = 0 ) THEN
        v_action := 'DELETE';
    ELSE
        v_action := 'UPDATE';
    END IF;

    -- Track which fields changed
    IF NVL(TO_CHAR(:NEW.EMAIL), '#') <> NVL(TO_CHAR(:OLD.EMAIL), '#') THEN v_changed_fields := v_changed_fields || 'EMAIL, '; END IF;
    IF NVL(TO_CHAR(:NEW.FIRST_NAME), '#') <> NVL(TO_CHAR(:OLD.FIRST_NAME), '#') THEN v_changed_fields := v_changed_fields || 'FIRST_NAME, '; END IF;
    IF NVL(TO_CHAR(:NEW.LAST_NAME), '#') <> NVL(TO_CHAR(:OLD.LAST_NAME), '#') THEN v_changed_fields := v_changed_fields || 'LAST_NAME, '; END IF;
    IF NVL(TO_CHAR(:NEW.ROLE_ID), '#') <> NVL(TO_CHAR(:OLD.ROLE_ID), '#') THEN v_changed_fields := v_changed_fields || 'ROLE_ID, '; END IF;
    IF NVL(TO_CHAR(:NEW.GENDER), '#') <> NVL(TO_CHAR(:OLD.GENDER), '#') THEN v_changed_fields := v_changed_fields || 'GENDER, '; END IF;
    IF NVL(TO_CHAR(:NEW.NATIONAL_NUMBER), '#') <> NVL(TO_CHAR(:OLD.NATIONAL_NUMBER), '#') THEN v_changed_fields := v_changed_fields || 'NATIONAL_NUMBER, '; END IF;
    IF NVL(TO_CHAR(:NEW.BIRTH_DATE), '#') <> NVL(TO_CHAR(:OLD.BIRTH_DATE), '#') THEN v_changed_fields := v_changed_fields || 'BIRTH_DATE, '; END IF;
    IF NVL(TO_CHAR(:NEW.ISDELETED), '#') <> NVL(TO_CHAR(:OLD.ISDELETED), '#') THEN v_changed_fields := v_changed_fields || 'ISDELETED, '; END IF;

    v_changed_fields := RTRIM(v_changed_fields, ', ');

    v_old_json := '{' || '"user_id": ' || :OLD.USER_ID || ',' || '"email": "' || :OLD.EMAIL || '",' || '"first_name": "' || :OLD.FIRST_NAME || '",' || '"last_name": "' || :OLD.LAST_NAME || '",' || '"role_id": ' || :OLD.ROLE_ID || ',' || '"gender": "' || :OLD.GENDER || '",' || '"national_number": ' || NVL(TO_CHAR(:OLD.NATIONAL_NUMBER), 'null') || ',' || '"birth_date": "' || NVL(TO_CHAR(:OLD.BIRTH_DATE, 'YYYY-MM-DD'), 'N/A') || '",' || '"is_deleted": ' || NVL(TO_CHAR(:OLD.ISDELETED), '0') || '}';
    v_new_json := '{' || '"user_id": ' || :NEW.USER_ID || ',' || '"email": "' || :NEW.EMAIL || '",' || '"first_name": "' || :NEW.FIRST_NAME || '",' || '"last_name": "' || :NEW.LAST_NAME || '",' || '"role_id": ' || :NEW.ROLE_ID || ',' || '"gender": "' || :NEW.GENDER || '",' || '"national_number": ' || NVL(TO_CHAR(:NEW.NATIONAL_NUMBER), 'null') || ',' || '"birth_date": "' || NVL(TO_CHAR(:NEW.BIRTH_DATE, 'YYYY-MM-DD'), 'N/A') || '",' || '"is_deleted": ' || NVL(TO_CHAR(:NEW.ISDELETED), '0') || '}';

    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME, CHANGED_FIELDS)
    VALUES ('USERS', :NEW.USER_ID, v_action, v_old_json, v_new_json, v_app_user, v_edited_user_name, v_changed_fields);
END;
/


-- 4. PARENT Triggers
CREATE OR REPLACE TRIGGER parent_trigger_insert
    AFTER INSERT ON PARENT
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_new_json         CLOB;
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);

    BEGIN
        SELECT FIRST_NAME || ' ' || LAST_NAME INTO v_edited_user_name FROM USERS WHERE USER_ID = :NEW.USER_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    v_new_json := '{' || '"parent_id": ' || :NEW.PARENT_ID || ',' || '"user_id": ' || :NEW.USER_ID || ',' || '"job_name": "' || NVL(:NEW.JOB_NAME, 'N/A') || '"' || '}';
    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME)
    VALUES ('PARENT', :NEW.PARENT_ID, 'INSERT', NULL, v_new_json, v_app_user, v_edited_user_name);
END;
/

CREATE OR REPLACE TRIGGER parent_trigger_update
    AFTER UPDATE ON PARENT
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_old_json         CLOB;
    v_new_json         CLOB;
    v_changed_fields   CLOB := '';
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);

    BEGIN
        SELECT FIRST_NAME || ' ' || LAST_NAME INTO v_edited_user_name FROM USERS WHERE USER_ID = :NEW.USER_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    IF NVL(TO_CHAR(:NEW.JOB_NAME), '#') <> NVL(TO_CHAR(:OLD.JOB_NAME), '#') THEN v_changed_fields := 'JOB_NAME'; END IF;

    v_old_json := '{' || '"parent_id": ' || :OLD.PARENT_ID || ',' || '"user_id": ' || :OLD.USER_ID || ',' || '"job_name": "' || NVL(:OLD.JOB_NAME, 'N/A') || '"' || '}';
    v_new_json := '{' || '"parent_id": ' || :NEW.PARENT_ID || ',' || '"user_id": ' || :NEW.USER_ID || ',' || '"job_name": "' || NVL(:NEW.JOB_NAME, 'N/A') || '"' || '}';

    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME, CHANGED_FIELDS)
    VALUES ('PARENT', :NEW.PARENT_ID, 'UPDATE', v_old_json, v_new_json, v_app_user, v_edited_user_name, v_changed_fields);
END;
/


-- 5. STUDENTS_PARENTS Triggers
CREATE OR REPLACE TRIGGER stud_parent_trigger_insert
    AFTER INSERT ON STUDENTS_PARENTS
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_new_json         CLOB;
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);

    -- Find user name by joining to STUDENT table
    BEGIN
        SELECT u.FIRST_NAME || ' ' || u.LAST_NAME INTO v_edited_user_name
        FROM USERS u JOIN STUDENT s ON u.USER_ID = s.USER_ID WHERE s.STUDENT_ID = :NEW.STUDENT_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    v_new_json := '{' || '"parent_id": ' || :NEW.PARENT_ID || ',' || '"student_id": ' || :NEW.STUDENT_ID || ',' || '"is_guardian": ' || :NEW.ISGUARDIAN || ',' || '"parent_role": "' || :NEW.PARENT_ROLE || '"' || '}';
    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME)
    VALUES ('STUDENTS_PARENTS', :NEW.STUDENT_ID, 'INSERT', NULL, v_new_json, v_app_user, v_edited_user_name);
END;
/

CREATE OR REPLACE TRIGGER stud_parent_trigger_update
    AFTER UPDATE ON STUDENTS_PARENTS
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_old_json         CLOB;
    v_new_json         CLOB;
    v_changed_fields   CLOB := '';
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);

    BEGIN
        SELECT u.FIRST_NAME || ' ' || u.LAST_NAME INTO v_edited_user_name
        FROM USERS u JOIN STUDENT s ON u.USER_ID = s.USER_ID WHERE s.STUDENT_ID = :NEW.STUDENT_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    IF NVL(TO_CHAR(:NEW.ISGUARDIAN), '#') <> NVL(TO_CHAR(:OLD.ISGUARDIAN), '#') THEN v_changed_fields := v_changed_fields || 'ISGUARDIAN, '; END IF;
    IF NVL(TO_CHAR(:NEW.PARENT_ROLE), '#') <> NVL(TO_CHAR(:OLD.PARENT_ROLE), '#') THEN v_changed_fields := v_changed_fields || 'PARENT_ROLE, '; END IF;
    v_changed_fields := RTRIM(v_changed_fields, ', ');

    v_old_json := '{' || '"parent_id": ' || :OLD.PARENT_ID || ',' || '"student_id": ' || :OLD.STUDENT_ID || ',' || '"is_guardian": ' || :OLD.ISGUARDIAN || ',' || '"parent_role": "' || :OLD.PARENT_ROLE || '"' || '}';
    v_new_json := '{' || '"parent_id": ' || :NEW.PARENT_ID || ',' || '"student_id": ' || :NEW.STUDENT_ID || ',' || '"is_guardian": ' || :NEW.ISGUARDIAN || ',' || '"parent_role": "' || :NEW.PARENT_ROLE || '"' || '}';

    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME, CHANGED_FIELDS)
    VALUES ('STUDENTS_PARENTS', :NEW.STUDENT_ID, 'UPDATE', v_old_json, v_new_json, v_app_user, v_edited_user_name, v_changed_fields);
END;
/


-- 6. STUDENT_MEDICAL_HISTORY Triggers
CREATE OR REPLACE TRIGGER med_history_trigger_insert
    AFTER INSERT ON STUDENT_MEDICAL_HISTORY
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_new_json         CLOB;
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);

    BEGIN
        SELECT u.FIRST_NAME || ' ' || u.LAST_NAME INTO v_edited_user_name
        FROM USERS u JOIN STUDENT s ON u.USER_ID = s.USER_ID WHERE s.STUDENT_ID = :NEW.STUDENT_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    v_new_json := '{' || '"student_id": ' || :NEW.STUDENT_ID || ',' || '"medical_note": "' || :NEW.MEDICAL_NOTE || '"' || '}';
    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME)
    VALUES ('STUDENT_MEDICAL_HISTORY', :NEW.STUDENT_ID, 'INSERT', NULL, v_new_json, v_app_user, v_edited_user_name);
END;
/

CREATE OR REPLACE TRIGGER med_history_trigger_update
    AFTER UPDATE ON STUDENT_MEDICAL_HISTORY
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_old_json         CLOB;
    v_new_json         CLOB;
    v_changed_fields   CLOB := '';
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);

    BEGIN
        SELECT u.FIRST_NAME || ' ' || u.LAST_NAME INTO v_edited_user_name
        FROM USERS u JOIN STUDENT s ON u.USER_ID = s.USER_ID WHERE s.STUDENT_ID = :NEW.STUDENT_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    IF NVL(TO_CHAR(:NEW.MEDICAL_NOTE), '#') <> NVL(TO_CHAR(:OLD.MEDICAL_NOTE), '#') THEN v_changed_fields := 'MEDICAL_NOTE'; END IF;

    v_old_json := '{' || '"student_id": ' || :OLD.STUDENT_ID || ',' || '"medical_note": "' || :OLD.MEDICAL_NOTE || '"' || '}';
    v_new_json := '{' || '"student_id": ' || :NEW.STUDENT_ID || ',' || '"medical_note": "' || :NEW.MEDICAL_NOTE || '"' || '}';

    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME, CHANGED_FIELDS)
    VALUES ('STUDENT_MEDICAL_HISTORY', :NEW.STUDENT_ID, 'UPDATE', v_old_json, v_new_json, v_app_user, v_edited_user_name, v_changed_fields);
END;
/


-- 7. USER_PHONE_NUMBERS Triggers
CREATE OR REPLACE TRIGGER phone_trigger_insert
    AFTER INSERT ON USER_PHONE_NUMBERS
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_new_json         CLOB;
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER);

    BEGIN
        SELECT FIRST_NAME || ' ' || LAST_NAME INTO v_edited_user_name
        FROM USERS WHERE USER_ID = :NEW.USER_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    v_new_json := '{' || '"user_id": ' || :NEW.USER_ID || ',' || '"phone_number": ' || :NEW.PHONE_NUMBER || '}';
    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME)
    VALUES ('USER_PHONE_NUMBERS', :NEW.USER_ID, 'INSERT', NULL, v_new_json, v_app_user, v_edited_user_name);
END;
/

CREATE OR REPLACE TRIGGER phone_trigger_update
    AFTER UPDATE ON USER_PHONE_NUMBERS
    FOR EACH ROW
DECLARE
    v_app_user         VARCHAR2(100);
    v_old_json         CLOB;
    v_new_json         CLOB;
    v_changed_fields   CLOB := '';
    v_edited_user_name VARCHAR2(300);
BEGIN
    v_app_user := NVL(SYS_CONTEXT('USERENV', 'CLIENT_INFO'), USER   );

    BEGIN
        SELECT FIRST_NAME || ' ' || LAST_NAME INTO v_edited_user_name
        FROM USERS WHERE USER_ID = :NEW.USER_ID;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_edited_user_name := 'Unknown User';
    END;

    IF NVL(TO_CHAR(:NEW.PHONE_NUMBER), '#') <> NVL(TO_CHAR(:OLD.PHONE_NUMBER), '#') THEN v_changed_fields := 'PHONE_NUMBER'; END IF;

    v_old_json := '{' || '"user_id": ' || :OLD.USER_ID || ',' || '"phone_number": ' || :OLD.PHONE_NUMBER || '}';
    v_new_json := '{' || '"user_id": ' || :NEW.USER_ID || ',' || '"phone_number": ' || :NEW.PHONE_NUMBER || '}';

    INSERT INTO AUDIT_LOGS (TABLE_NAME, RECORD_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY, EDITED_USER_NAME, CHANGED_FIELDS)
    VALUES ('USER_PHONE_NUMBERS', :NEW.USER_ID, 'UPDATE', v_old_json, v_new_json, v_app_user, v_edited_user_name, v_changed_fields);
END;
/

select * from PARENT;