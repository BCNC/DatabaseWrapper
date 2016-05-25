DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_createUser`(
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_year VARCHAR(255),
    IN p_major VARCHAR(255),
    IN p_major2 VARCHAR(255),
    IN p_minor VARCHAR(255),
    IN p_minor2 VARCHAR(255),
    IN p_cgpa VARCHAR(255),
    IN p_mgpa VARCHAR(255),
    IN p_exp1 VARCHAR(255),
    IN p_exp2 VARCHAR(255),
    IN p_exp3 VARCHAR(255),
    IN p_exp4 VARCHAR(255),
    IN p_exp5 VARCHAR(255)

)
BEGIN
    if ( select exists (select 1 from tbl_user where user_name = p_name) ) THEN
     
        select 'Username Exists !!';
     
    ELSE
     
        insert into tbl_user
        (
            user_name,
            user_email,
            user_year,
            user_major,
            user_major2,
            user_minor,
            user_minor2,
            user_cgpa,
            user_mgpa,
            user_exp1,
            user_exp2,
            user_exp3,
            user_exp4,
            user_exp5
        )
        values
        (
            p_name,
            p_email,
            p_year,
            p_major,
            p_major2,
            p_minor,
            p_minor2,
            p_cgpa,
            p_mgpa,
            p_exp1,
            p_exp2,
            p_exp3,
            p_exp4,
            p_exp5
        );
     
    END IF;
END$$
DELIMITER ;




CREATE TABLE `Resumes`.`tbl_user` (
  `user_id` BIGINT UNIQUE AUTO_INCREMENT,
  `user_name` VARCHAR(255) NULL,
  `user_email` VARCHAR(255) NULL,
  `user_year` VARCHAR(255) NULL,
  `user_major` VARCHAR(255) NULL,
  `user_major2` VARCHAR(255) NULL,
  `user_minor` VARCHAR(255) NULL,
  `user_minor2` VARCHAR(255) NULL,
  `user_cgpa` VARCHAR(255) NULL,
  `user_mgpa` VARCHAR(255) NULL,
  `user_exp1` VARCHAR(255) NULL,
  `user_exp2` VARCHAR(255) NULL,
  `user_exp3` VARCHAR(255) NULL,
  `user_exp4` VARCHAR(255) NULL,
  `user_exp5` VARCHAR(255) NULL,
  PRIMARY KEY (`user_id`));


ALTER TABLE `bucketlist`.`tbl_user`
CHANGE COLUMN `user_password` `user_password` VARCHAR(255) NULL DEFAULT NULL ;