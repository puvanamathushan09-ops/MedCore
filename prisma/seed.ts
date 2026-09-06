import { PrismaClient, Role, ArticleStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MedCore Phase 3 database seeding...');

  // 1. Create or update Default Medical Reviewer Author User
  const reviewerPasswordHash = await bcrypt.hash('DevReviewer2026!#MedCoreSecurePass', 10);
  const author = await prisma.user.upsert({
    where: { email: 'reviewer@medcore.local' },
    update: {
      passwordHash: reviewerPasswordHash,
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      role: Role.MEDICAL_REVIEWER,
      isActive: true,
    },
    create: {
      email: 'reviewer@medcore.local',
      passwordHash: reviewerPasswordHash,
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      role: Role.MEDICAL_REVIEWER,
      isActive: true,
    },
  });
  console.log(`👤 Reviewer User seeded: ${author.email}`);

  // 1b. Create or update Development Admin User
  const adminPasswordHash = await bcrypt.hash('DevAdmin2026!#MedCoreSecurePass', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@medcore.local' },
    update: {
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@medcore.local',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`👤 Admin User seeded: ${adminUser.email}`);

  // 2. Create or update Subject: Anatomy
  const anatomySubject = await prisma.subject.upsert({
    where: { slug: 'anatomy' },
    update: {
      title: 'Anatomy',
      description: 'Study of human body structures, gross anatomy, and clinical relationships.',
      orderIndex: 1,
    },
    create: {
      title: 'Anatomy',
      slug: 'anatomy',
      description: 'Study of human body structures, gross anatomy, and clinical relationships.',
      orderIndex: 1,
    },
  });
  console.log(`📚 Subject seeded: ${anatomySubject.title} (${anatomySubject.slug})`);

  // 3. Create or update Topics under Anatomy
  const upperLimbTopic = await prisma.topic.upsert({
    where: { slug: 'upper-limb' },
    update: {
      title: 'Upper Limb',
      description: 'Anatomy of shoulder, arm, forearm, hand, brachial plexus, and neurovascular bundles.',
      subjectId: anatomySubject.id,
      orderIndex: 1,
    },
    create: {
      title: 'Upper Limb',
      slug: 'upper-limb',
      description: 'Anatomy of shoulder, arm, forearm, hand, brachial plexus, and neurovascular bundles.',
      subjectId: anatomySubject.id,
      orderIndex: 1,
    },
  });
  console.log(`📌 Topic seeded: ${upperLimbTopic.title} (${upperLimbTopic.slug})`);

  const thoraxTopic = await prisma.topic.upsert({
    where: { slug: 'thorax' },
    update: {
      title: 'Thorax',
      description: 'Anatomy of thoracic wall, lungs, mediastinum, heart, and great vessels.',
      subjectId: anatomySubject.id,
      orderIndex: 2,
    },
    create: {
      title: 'Thorax',
      slug: 'thorax',
      description: 'Anatomy of thoracic wall, lungs, mediastinum, heart, and great vessels.',
      subjectId: anatomySubject.id,
      orderIndex: 2,
    },
  });
  console.log(`📌 Topic seeded: ${thoraxTopic.title} (${thoraxTopic.slug})`);

  // 4. Create or update Articles under Topics
  const article1 = await prisma.article.upsert({
    where: { slug: 'anatomical-terminology-and-body-planes' },
    update: {
      title: 'Anatomical Terminology and Body Planes',
      summary: 'Essential directional terms, body planes, and anatomical positions used in medical science.',
      content: `Standard anatomical position provides a reference frame for describing body structures.

Body Planes:
- Sagittal Plane: Divides the body vertically into right and left portions.
- Coronal (Frontal) Plane: Divides the body into anterior (front) and posterior (back) portions.
- Transverse (Axial) Plane: Divides the body horizontally into superior (upper) and inferior (lower) portions.

Directional Terms:
- Anterior / Ventral: Towards the front of the body.
- Posterior / Dorsal: Towards the back of the body.
- Medial: Nearer to the midline.
- Lateral: Farther from the midline.
- Proximal: Nearer to the attachment point of a limb.
- Distal: Farther from the attachment point of a limb.`,
      status: ArticleStatus.PUBLISHED,
      authorId: author.id,
      subjectId: anatomySubject.id,
      topicId: upperLimbTopic.id,
      publishedAt: new Date('2026-01-15T09:00:00Z'),
    },
    create: {
      title: 'Anatomical Terminology and Body Planes',
      slug: 'anatomical-terminology-and-body-planes',
      summary: 'Essential directional terms, body planes, and anatomical positions used in medical science.',
      content: `Standard anatomical position provides a reference frame for describing body structures.

Body Planes:
- Sagittal Plane: Divides the body vertically into right and left portions.
- Coronal (Frontal) Plane: Divides the body into anterior (front) and posterior (back) portions.
- Transverse (Axial) Plane: Divides the body horizontally into superior (upper) and inferior (lower) portions.

Directional Terms:
- Anterior / Ventral: Towards the front of the body.
- Posterior / Dorsal: Towards the back of the body.
- Medial: Nearer to the midline.
- Lateral: Farther from the midline.
- Proximal: Nearer to the attachment point of a limb.
- Distal: Farther from the attachment point of a limb.`,
      status: ArticleStatus.PUBLISHED,
      authorId: author.id,
      subjectId: anatomySubject.id,
      topicId: upperLimbTopic.id,
      publishedAt: new Date('2026-01-15T09:00:00Z'),
    },
  });
  console.log(`📄 Article seeded: ${article1.title}`);

  const article2 = await prisma.article.upsert({
    where: { slug: 'brachial-plexus-anatomy-and-clinical-correlates' },
    update: {
      title: 'Brachial Plexus Anatomy and Clinical Correlates',
      summary: 'Comprehensive overview of roots, trunks, divisions, cords, and terminal branches of the brachial plexus.',
      content: `The brachial plexus is a network of nerves formed by the anterior rami of spinal nerves C5 through T1.

Structure Breakdown:
- Roots: C5, C6, C7, C8, T1
- Trunks: Superior (C5-C6), Middle (C7), Inferior (C8-T1)
- Divisions: Anterior and Posterior divisions for each trunk
- Cords: Lateral, Posterior, Medial cords (named relative to the axillary artery)

Terminal Branches:
- Musculocutaneous Nerve (C5-C7)
- Axillary Nerve (C5-C6)
- Radial Nerve (C5-T1)
- Median Nerve (C5-T1)
- Ulnar Nerve (C8-T1)

Clinical Correlates:
- Erb-Duchenne Palsy: Injury to upper trunk (C5-C6), producing waiter's tip position.
- Klumpke Palsy: Injury to lower trunk (C8-T1), producing claw hand deformity.`,
      status: ArticleStatus.PUBLISHED,
      authorId: author.id,
      subjectId: anatomySubject.id,
      topicId: upperLimbTopic.id,
      publishedAt: new Date('2026-02-01T10:30:00Z'),
    },
    create: {
      title: 'Brachial Plexus Anatomy and Clinical Correlates',
      slug: 'brachial-plexus-anatomy-and-clinical-correlates',
      summary: 'Comprehensive overview of roots, trunks, divisions, cords, and terminal branches of the brachial plexus.',
      content: `The brachial plexus is a network of nerves formed by the anterior rami of spinal nerves C5 through T1.

Structure Breakdown:
- Roots: C5, C6, C7, C8, T1
- Trunks: Superior (C5-C6), Middle (C7), Inferior (C8-T1)
- Divisions: Anterior and Posterior divisions for each trunk
- Cords: Lateral, Posterior, Medial cords (named relative to the axillary artery)

Terminal Branches:
- Musculocutaneous Nerve (C5-C7)
- Axillary Nerve (C5-C6)
- Radial Nerve (C5-T1)
- Median Nerve (C5-T1)
- Ulnar Nerve (C8-T1)

Clinical Correlates:
- Erb-Duchenne Palsy: Injury to upper trunk (C5-C6), producing waiter's tip position.
- Klumpke Palsy: Injury to lower trunk (C8-T1), producing claw hand deformity.`,
      status: ArticleStatus.PUBLISHED,
      authorId: author.id,
      subjectId: anatomySubject.id,
      topicId: upperLimbTopic.id,
      publishedAt: new Date('2026-02-01T10:30:00Z'),
    },
  });
  console.log(`📄 Article seeded: ${article2.title}`);

  const article3 = await prisma.article.upsert({
    where: { slug: 'thoracic-cage-structure-and-intercostal-muscles' },
    update: {
      title: 'Thoracic Cage Structure and Intercostal Muscles',
      summary: 'Anatomical organization of the ribs, sternum, thoracic vertebrae, and respiration muscle layers.',
      content: `The thoracic cage forms the osseocartilaginous framework protecting thoracic organs and supporting respiration.

Components:
- 12 Pairs of Ribs: True ribs (1-7), False ribs (8-10), Floating ribs (11-12)
- Sternum: Manubrium, Body, Xiphoid Process
- 12 Thoracic Vertebrae and intervertebral discs

Intercostal Muscles & Neurovascular Bundle:
- External Intercostals: Elevate ribs during inspiration.
- Internal Intercostals: Depress ribs during forced expiration.
- Innermost Intercostals: Deepest layer separated from internal intercostals by the intercostal neurovascular bundle (VAN: Vein, Artery, Nerve running under rib costal groove).`,
      status: ArticleStatus.PUBLISHED,
      authorId: author.id,
      subjectId: anatomySubject.id,
      topicId: thoraxTopic.id,
      publishedAt: new Date('2026-02-10T14:00:00Z'),
    },
    create: {
      title: 'Thoracic Cage Structure and Intercostal Muscles',
      slug: 'thoracic-cage-structure-and-intercostal-muscles',
      summary: 'Anatomical organization of the ribs, sternum, thoracic vertebrae, and respiration muscle layers.',
      content: `The thoracic cage forms the osseocartilaginous framework protecting thoracic organs and supporting respiration.

Components:
- 12 Pairs of Ribs: True ribs (1-7), False ribs (8-10), Floating ribs (11-12)
- Sternum: Manubrium, Body, Xiphoid Process
- 12 Thoracic Vertebrae and intervertebral discs

Intercostal Muscles & Neurovascular Bundle:
- External Intercostals: Elevate ribs during inspiration.
- Internal Intercostals: Depress ribs during forced expiration.
- Innermost Intercostals: Deepest layer separated from internal intercostals by the intercostal neurovascular bundle (VAN: Vein, Artery, Nerve running under rib costal groove).`,
      status: ArticleStatus.PUBLISHED,
      authorId: author.id,
      subjectId: anatomySubject.id,
      topicId: thoraxTopic.id,
      publishedAt: new Date('2026-02-10T14:00:00Z'),
    },
  });
  console.log(`📄 Article seeded: ${article3.title}`);

  console.log('✅ MedCore Phase 3 database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
