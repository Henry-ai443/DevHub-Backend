const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');
const fetch = require('node-fetch');



exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.query(
      `
      SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.bio,
        p.avatar_url,
        p.website_url,
        p.skills,
        p.company_name,
        p.created_at,
        p.updated_at
      FROM profiles p
      WHERE p.user_id = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ profile: null });
    }

    return res.json({ profile: rows[0] });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


/**
 * CREATE OR UPDATE PROFILE
 */

exports.upsertProfile = async (req, res) => {
  const userId = req.user.userId;

  const {
    first_name,
    last_name,
    bio,
    website_url,
    skills,
    company_name,
  } = req.body;

  let avatarUrl = null;

  try {
    // 1️⃣ User uploaded avatar
    if (req.file) {
      avatarUrl = req.file.path; // Cloudinary URL from multer
    } else {
      // 2️⃣ Generate DiceBear avatar if no upload
      const seed = userId;
      const avatarApiUrl = `https://api.dicebear.com/7.x/identicon/png?seed=${seed}`;

      const response = await fetch(avatarApiUrl);
      const buffer = await response.buffer();

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'avatars' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      avatarUrl = uploadResult.secure_url;
    }

    // 3️⃣ Insert or update profile
    await pool.query(
      `
      INSERT INTO profiles (
        user_id, first_name, last_name, bio, avatar_url, website_url, skills, company_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        bio = VALUES(bio),
        avatar_url = VALUES(avatar_url),
        website_url = VALUES(website_url),
        skills = VALUES(skills),
        company_name = VALUES(company_name),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        userId,
        first_name,
        last_name,
        bio,
        avatarUrl,
        website_url,
        skills,
        company_name
      ]
    );

    return res.json({ message: 'Profile saved successfully', avatarUrl });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
