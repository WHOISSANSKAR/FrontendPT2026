import { 
  ProjectItem, 
  ProjectLocation,
  LocationMilestone,
  LocationComment,
  MilestoneTask,
  MilestoneTaskActivity,
  CriticalSpareItem, 
  SupportTicketItem, 
  OrderItem, 
  CalendarEventItem, 
  NotificationItem, 
  CartItem 
} from '../types';

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'prj-alpha',
    code: 'PA',
    name: 'Project Alpha',
    customer: 'Tata Motors Logistics',
    category: 'Industrial Automation',
    status: 'In Progress',
    progress: 82,
    currentPhase: 'Implementation',
    velocity: 'Velocity on target',
    manager: 'Kavita Nair',
    startDate: '01 Aug 2026',
    expectedCompletion: 'Oct 15, 2026',
    budget: '₹34,00,000',
    lastUpdated: 'Today',
    milestonesCount: 5,
    completedMilestones: 4,
    locationsCount: 8,
    countriesCount: 6,
    locations: [
      {
        id: 'loc-1',
        country: 'India',
        countryCode: 'US',
        state: 'Delhi NCR',
        city: 'Delhi',
        phase: 'Implementation',
        status: 'In Progress',
        progress: 85,
        assignedTeam: 'Midwest Robotics Guild',
        lastUpdated: 'Today',
        milestones: [
          {
            id: 'm-col-1',
            name: 'Site Survey & Seismic Anchor Alignment',
            description: 'Complete 3D lidar architectural scan, concrete core sampling, and structural floor anchor drill-outs.',
            startDate: '12 May 2026',
            endDate: '28 May 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-col-2',
            name: 'High-Voltage Substation & Optical Backbone',
            description: 'Dual 480V/1200A electrical bus installation and redundant 10Gbps optical fiber line termination.',
            startDate: '02 Jun 2026',
            endDate: '24 Jun 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-col-3',
            name: 'Gantry Rail Assembly & 6-Axis Robot Deployment',
            description: 'Mechanical positioning of overhead automated gantry systems and six articulated robotic arm cells.',
            startDate: '28 Jun 2026',
            endDate: '02 Aug 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-col-4',
            name: 'Safety Interlock, Light Curtain & PLC Calibration',
            description: 'Wiring of Rockwell GuardLogix safety controllers and optoelectronic perimeter barriers across Zone A-D.',
            startDate: '08 Aug 2026',
            endDate: '04 Sep 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-col-5',
            name: 'Full-Rate Production Trial & QA Validation',
            description: '72-hour sustained pilot throughput testing with continuous real-time cycle telemetry inspection.',
            startDate: '10 Sep 2026',
            endDate: '30 Sep 2026',
            status: 'In Progress',
            progress: 25
          }
        ],
        comments: [
          {
            id: 'c-col-1',
            author: 'Vaniya Batra',
            role: 'Lead Systems Architect',
            text: 'Substation tie-in verified at 480V with zero phase imbalance. Midwest Robotics Guild cleared to commence full-speed gantry calibration on Zone A.',
            timestamp: 'Today, 09:42 AM'
          },
          {
            id: 'c-col-2',
            author: 'Rohan Verma',
            role: 'QA Commissioning Lead',
            text: 'PLC telemetry stream connected to PseudoTeam central monitor. Safety light curtains tested and passed OSHA Annex C requirements.',
            timestamp: 'Yesterday, 04:15 PM'
          },
          {
            id: 'c-col-3',
            author: 'Aarav Mehta',
            role: 'Project Director',
            text: 'Great progress on the Delhi facility. Client stakeholder walkthrough scheduled for next Thursday.',
            timestamp: '14 Sep 2026, 11:20 AM'
          }
        ]
      },
      {
        id: 'loc-2',
        country: 'India',
        countryCode: 'US',
        state: 'Maharashtra',
        city: 'Mumbai',
        phase: 'Commissioned',
        status: 'Completed',
        progress: 100,
        assignedTeam: 'Great Lakes Systems',
        lastUpdated: 'Yesterday',
        milestones: [
          {
            id: 'm-det-1',
            name: 'High-Bay Structural Staging & Heavy Foundation',
            description: 'Reinforced floor load rating certification and crane hoist rigging infrastructure installation.',
            startDate: '04 Apr 2026',
            endDate: '25 Apr 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-det-2',
            name: 'Conveyor Network & High-Speed Palletizers',
            description: 'Assembly of automated modular roller conveyor lines and dual robotic palletizing units.',
            startDate: '28 Apr 2026',
            endDate: '22 May 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-det-3',
            name: 'SCADA & Industrial Ethernet Infrastructure',
            description: 'Distributed I/O bus networking and Profinet communications setup for plantwide telemetry.',
            startDate: '26 May 2026',
            endDate: '19 Jun 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-det-4',
            name: 'Cold Commissioning & Integrated Dry Runs',
            description: 'Complete simulated operational testing without product payload, validating error recovery sequences.',
            startDate: '24 Jun 2026',
            endDate: '18 Jul 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-det-5',
            name: 'Final Acceptance Certificate (FAC) Sign-Off',
            description: 'Plant manager and client engineering leadership sign-off on 100% operational throughput readiness.',
            startDate: '22 Jul 2026',
            endDate: '15 Aug 2026',
            status: 'Completed',
            progress: 100
          }
        ],
        comments: [
          {
            id: 'c-det-1',
            author: 'Sneha Kulkarni',
            role: 'Commissioning Engineer',
            text: 'Final Acceptance Certificate signed by Great Lakes Systems facility head. Handover completed smoothly ahead of deadline.',
            timestamp: 'Yesterday, 02:30 PM'
          },
          {
            id: 'c-det-2',
            author: 'Rohan Verma',
            role: 'QA Lead',
            text: 'Mumbai warranty period now active. Telemetry logging in 24/7 autonomous monitoring mode with zero alarms logged.',
            timestamp: '13 Sep 2026, 10:15 AM'
          }
        ]
      },
      {
        id: 'loc-3',
        country: 'India',
        countryCode: 'DE',
        state: 'Karnataka',
        city: 'Bengaluru',
        phase: 'Site Preparation',
        status: 'In Progress',
        progress: 80,
        assignedTeam: 'Bharat Mechatronics',
        lastUpdated: '12 Sep',
        milestones: [
          {
            id: 'm-mun-1',
            name: 'Karnataka Environmental & Seismic Permitting',
            description: 'Compliance submission and municipal zoning clearance for industrial automation facility footprint.',
            startDate: '15 May 2026',
            endDate: '12 Jun 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-mun-2',
            name: 'Cleanroom ISO-6 Enclosure Assembly',
            description: 'Modular HEPA ceiling grid construction and laminar flow environmental control installation.',
            startDate: '18 Jun 2026',
            endDate: '20 Jul 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-mun-3',
            name: 'Harmonic Drive & Servo Axis Installation',
            description: 'High-precision German-engineered drive assemblies and multi-axis synchronizers mounted to cleanroom frame.',
            startDate: '25 Jul 2026',
            endDate: '28 Aug 2026',
            status: 'Completed',
            progress: 100
          },
          {
            id: 'm-mun-4',
            name: 'BIS & PESO Machinery Safety Compliance Certification',
            description: 'Comprehensive electrical safety, noise emissions, and risk assessment audit by notified body.',
            startDate: '02 Sep 2026',
            endDate: '26 Sep 2026',
            status: 'In Progress',
            progress: 20
          },
          {
            id: 'm-mun-5',
            name: 'Factory Acceptance Testing (FAT) with Client',
            description: 'Multi-batch pilot demonstration in presence of client engineering leads prior to full operational handover.',
            startDate: '02 Oct 2026',
            endDate: '22 Oct 2026',
            status: 'Pending',
            progress: 0
          }
        ],
        comments: [
          {
            id: 'c-mun-1',
            author: 'Harish Wankhede',
            role: 'Site Operations Manager',
            text: 'KSPCB pre-audit completed for Bengaluru cleanroom. Awaiting final BIS certification document submission next week.',
            timestamp: '12 Sep 2026, 03:40 PM'
          },
          {
            id: 'c-mun-2',
            author: 'Kavita Nair',
            role: 'Safety Engineer',
            text: 'Harmonic drive torque profiles verified against DIN EN ISO 13849-1 PL d safety standards.',
            timestamp: '08 Sep 2026, 11:05 AM'
          }
        ]
      }
    ]
  },
  {
    id: 'prj-beta',
    code: 'PB',
    name: 'Project Beta',
    customer: 'Adani Logistics & Ports',
    category: 'Supply Chain Optics',
    status: 'In Progress',
    progress: 64,
    currentPhase: 'Hardware Setup',
    velocity: 'On schedule',
    manager: 'Aarav Mehta',
    startDate: '15 Jun 2026',
    expectedCompletion: 'Nov 20, 2026',
    budget: '₹52,00,000',
    lastUpdated: 'Yesterday',
    milestonesCount: 6,
    completedMilestones: 3,
    locationsCount: 5,
    countriesCount: 4,
    locations: [
      {
        id: 'loc-201',
        country: 'India',
        countryCode: 'IN',
        state: 'Uttar Pradesh',
        city: 'Noida',
        phase: 'Deployment',
        status: 'In Progress',
        progress: 65,
        assignedTeam: 'Rhine-Main Lead Team',
        lastUpdated: 'Yesterday'
      }
    ]
  },
  {
    id: 'prj-gamma',
    code: 'PG',
    name: 'Project Gamma',
    customer: 'Reliance Industrial Infra',
    category: 'Cleanroom Sensor Grid',
    status: 'In Progress',
    progress: 95,
    currentPhase: 'Testing & QA',
    velocity: 'Ahead of schedule',
    manager: 'Sneha Kulkarni',
    startDate: '10 May 2026',
    expectedCompletion: 'Sep 25, 2026',
    budget: '₹28,50,000',
    lastUpdated: '12 Sep',
    milestonesCount: 5,
    completedMilestones: 4,
    locationsCount: 4,
    countriesCount: 2,
    locations: [
      {
        id: 'loc-301',
        country: 'India',
        countryCode: 'US',
        state: 'Haryana',
        city: 'Gurugram',
        phase: 'Final Acceptance',
        status: 'In Progress',
        progress: 95,
        assignedTeam: 'Silicon Valley Labs',
        lastUpdated: '12 Sep'
      }
    ]
  },
  {
    id: 'prj-delta',
    code: 'PD',
    name: 'Project Delta',
    customer: 'Bharat Heavy Electricals (BHEL)',
    category: 'High-Speed Conveyance',
    status: 'Critical',
    progress: 28,
    currentPhase: 'Diagnostic & Rework',
    velocity: 'Requires intervention',
    manager: 'Devendra Sharma',
    startDate: '01 Jul 2026',
    expectedCompletion: 'Dec 20, 2026',
    budget: '₹74,00,000',
    lastUpdated: '10 Sep',
    milestonesCount: 7,
    completedMilestones: 1,
    locationsCount: 6,
    countriesCount: 3,
    locations: [
      {
        id: 'loc-401',
        country: 'India',
        countryCode: 'IN',
        state: 'Gujarat',
        city: 'Surat',
        phase: 'Line 2 Troubleshooting',
        status: 'Critical',
        progress: 28,
        assignedTeam: 'Euro Port Automation',
        lastUpdated: '10 Sep'
      }
    ]
  },
  {
    id: 'prj-apex',
    code: 'PAX',
    name: 'Project Apex',
    customer: 'Mahindra Automation Systems',
    category: 'Heavy Machine Telemetry',
    status: 'In Progress',
    progress: 98,
    currentPhase: 'Commissioning & Handover',
    velocity: 'Ahead of schedule',
    manager: 'Kavita Nair',
    startDate: '15 Apr 2026',
    expectedCompletion: 'Sep 18, 2026',
    budget: '₹89,00,000',
    lastUpdated: '08 Sep',
    milestonesCount: 6,
    completedMilestones: 5,
    locationsCount: 3,
    countriesCount: 2,
    locations: [
      {
        id: 'loc-501',
        country: 'India',
        countryCode: 'US',
        state: 'Punjab',
        city: 'Chandigarh',
        phase: 'Final Handover',
        status: 'In Progress',
        progress: 98,
        assignedTeam: 'Keystone Heavy Robotics',
        lastUpdated: '08 Sep'
      }
    ]
  },
  {
    id: 'prj-002',
    code: 'PRJ-002',
    name: 'Project Orion',
    customer: 'Infosys Edge Infrastructure',
    category: 'Supply Chain Optics',
    status: 'In Progress',
    progress: 71,
    currentPhase: 'Integration & Testing',
    velocity: 'On track',
    manager: 'Aarav Mehta',
    startDate: '15 May 2026',
    expectedCompletion: '14 Oct 2026',
    budget: '₹52,00,000',
    lastUpdated: 'Yesterday',
    milestonesCount: 6,
    completedMilestones: 4,
    locationsCount: 5,
    countriesCount: 4,
    locations: [
      {
        id: 'loc-201',
        country: 'India',
        countryCode: 'IN',
        state: 'Uttar Pradesh',
        city: 'Noida',
        phase: 'Full Deployment',
        status: 'Completed',
        progress: 100,
        assignedTeam: 'Rhine-Main Lead Team',
        lastUpdated: 'Yesterday'
      },
      {
        id: 'loc-202',
        country: 'India',
        countryCode: 'US',
        state: 'Telangana',
        city: 'Hyderabad',
        phase: 'Final Acceptance',
        status: 'Completed',
        progress: 100,
        assignedTeam: 'Windy City Logistics',
        lastUpdated: '2 days ago'
      },
      {
        id: 'loc-203',
        country: 'India',
        countryCode: 'IN',
        state: 'Tamil Nadu',
        city: 'Chennai',
        phase: 'Handover & Signoff',
        status: 'Completed',
        progress: 100,
        assignedTeam: 'Lion City Logistics',
        lastUpdated: '12 Sep'
      }
    ]
  },
  {
    id: 'prj-003',
    code: 'PRJ-003',
    name: 'Project Nova',
    customer: 'Wipro Industrial Tech',
    category: 'Cleanroom Sensor Grid',
    status: 'In Progress',
    progress: 45,
    currentPhase: 'Planning & Hardware Proc.',
    velocity: 'On pace',
    manager: 'Sneha Kulkarni',
    startDate: '10 Jul 2026',
    expectedCompletion: 'Nov 30, 2026',
    budget: '₹28,50,000',
    lastUpdated: '12 Sep',
    milestonesCount: 4,
    completedMilestones: 1,
    locationsCount: 4,
    countriesCount: 2,
    locations: [
      {
        id: 'loc-301',
        country: 'India',
        countryCode: 'US',
        state: 'Haryana',
        city: 'Gurugram',
        phase: 'Sensor Calibration',
        status: 'In Progress',
        progress: 55,
        assignedTeam: 'Silicon Valley Labs',
        lastUpdated: '12 Sep'
      },
      {
        id: 'loc-302',
        country: 'India',
        countryCode: 'IN',
        state: 'Maharashtra',
        city: 'Nagpur',
        phase: 'Cleanroom Prep',
        status: 'In Progress',
        progress: 40,
        assignedTeam: 'Science Park Ops',
        lastUpdated: '10 Sep'
      }
    ]
  },
  {
    id: 'prj-004',
    code: 'PRJ-004',
    name: 'Project Atlas',
    customer: 'ITC Supply Chain Logistics',
    category: 'High-Speed Conveyance',
    status: 'On Hold',
    progress: 30,
    currentPhase: 'Permit & Regulatory Review',
    velocity: 'Pending municipal permit',
    manager: 'Devendra Sharma',
    startDate: '01 Jun 2026',
    expectedCompletion: 'Dec 20, 2026',
    budget: '₹74,00,000',
    lastUpdated: '10 Sep',
    milestonesCount: 7,
    completedMilestones: 2,
    locationsCount: 3,
    countriesCount: 2,
    locations: [
      {
        id: 'loc-401',
        country: 'India',
        countryCode: 'IN',
        state: 'Gujarat',
        city: 'Surat',
        phase: 'Foundation Construction',
        status: 'On Hold',
        progress: 35,
        assignedTeam: 'EuroPort Engineering',
        lastUpdated: '10 Sep'
      },
      {
        id: 'loc-402',
        country: 'India',
        countryCode: 'US',
        state: 'Kerala',
        city: 'Kochi',
        phase: 'Structural Framework',
        status: 'On Hold',
        progress: 25,
        assignedTeam: 'Coastal Works Group',
        lastUpdated: '08 Sep'
      }
    ]
  },
  {
    id: 'prj-005',
    code: 'PRJ-005',
    name: 'Project Helios',
    customer: 'Godrej & Boyce Manufacturing',
    category: 'Solar Inverter Telemetry',
    status: 'Completed',
    progress: 100,
    currentPhase: 'Final Commissioning',
    velocity: 'Completed flawlessly',
    manager: 'Ananya Deshmukh',
    startDate: '20 Apr 2026',
    expectedCompletion: '08 Sep 2026',
    budget: '₹41,00,000',
    lastUpdated: '08 Sep',
    milestonesCount: 5,
    completedMilestones: 5,
    locationsCount: 6,
    countriesCount: 3,
    locations: [
      {
        id: 'loc-501',
        country: 'India',
        countryCode: 'IN',
        state: 'Andhra Pradesh',
        city: 'Visakhapatnam',
        phase: 'Grid Tie Sync',
        status: 'Completed',
        progress: 100,
        assignedTeam: 'Sunstate Renewables',
        lastUpdated: '08 Sep'
      },
      {
        id: 'loc-502',
        country: 'India',
        countryCode: 'US',
        state: 'Gujarat',
        city: 'Ahmedabad',
        phase: 'Inverter Deployment',
        status: 'Completed',
        progress: 100,
        assignedTeam: 'Desert Energy Tech',
        lastUpdated: '05 Sep'
      }
    ]
  },
  {
    id: 'prj-delhi-auto',
    code: 'DAU',
    name: 'Delhi Automation Upgrade',
    customer: 'Tata Motors Logistics',
    category: 'Logistics Automation',
    status: 'Not Started',
    progress: 0,
    currentPhase: 'Planning & Survey',
    velocity: 'Pending kickoff',
    manager: 'Vikramaditya Sharma',
    startDate: '15 Oct 2026',
    expectedCompletion: '20 Jan 2027',
    budget: '₹52,00,000',
    lastUpdated: 'Yesterday',
    milestonesCount: 4,
    completedMilestones: 0,
    locationsCount: 3,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-dau-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Delhi NCR',
        city: 'Delhi',
        phase: 'Site Survey',
        status: 'Pending',
        progress: 0,
        assignedTeam: 'North Automation Crew',
        lastUpdated: 'Yesterday'
      }
    ]
  },
  {
    id: 'prj-ahmedabad-port',
    code: 'APT',
    name: 'Ahmedabad Port Terminal',
    customer: 'Adani Logistics & Ports',
    category: 'Port Handling & Freight',
    status: 'Not Started',
    progress: 0,
    currentPhase: 'Site Permitting',
    velocity: 'Awaiting clearance',
    manager: 'Deepak Patel',
    startDate: '01 Nov 2026',
    expectedCompletion: '15 Mar 2027',
    budget: '₹88,00,000',
    lastUpdated: '09 Sep',
    milestonesCount: 5,
    completedMilestones: 0,
    locationsCount: 2,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-apt-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Gujarat',
        city: 'Ahmedabad',
        phase: 'Permit Verification',
        status: 'Pending',
        progress: 0,
        assignedTeam: 'West Maritime Logistics',
        lastUpdated: '09 Sep'
      }
    ]
  },
  {
    id: 'prj-chandigarh-grid',
    code: 'CSG',
    name: 'Chandigarh Smart Grid',
    customer: 'Larsen & Toubro',
    category: 'Smart Energy Infrastructure',
    status: 'Not Started',
    progress: 0,
    currentPhase: 'Architectural Blueprint',
    velocity: 'Design signoff stage',
    manager: 'Harpreet Singh',
    startDate: '25 Oct 2026',
    expectedCompletion: '28 Feb 2027',
    budget: '₹46,00,000',
    lastUpdated: '05 Sep',
    milestonesCount: 4,
    completedMilestones: 0,
    locationsCount: 2,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-csg-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Punjab & Haryana',
        city: 'Chandigarh',
        phase: 'Schematic Review',
        status: 'Pending',
        progress: 0,
        assignedTeam: 'Tri-City Power Solutions',
        lastUpdated: '05 Sep'
      }
    ]
  },
  {
    id: 'prj-jaipur-fac',
    code: 'JFM',
    name: 'Jaipur Facility Modernization',
    customer: 'Mahindra Automation Systems',
    category: 'Robotics & Assembly',
    status: 'Not Started',
    progress: 0,
    currentPhase: 'Procurement Pipeline',
    velocity: 'Vendor bidding ongoing',
    manager: 'Rathore Meena',
    startDate: '10 Nov 2026',
    expectedCompletion: '30 Apr 2027',
    budget: '₹37,50,000',
    lastUpdated: '11 Sep',
    milestonesCount: 4,
    completedMilestones: 0,
    locationsCount: 2,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-jfm-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Rajasthan',
        city: 'Jaipur',
        phase: 'Component Allocation',
        status: 'Pending',
        progress: 0,
        assignedTeam: 'Desert Robotics Division',
        lastUpdated: '11 Sep'
      }
    ]
  },
  {
    id: 'prj-mumbai-logistics',
    code: 'MLE',
    name: 'Mumbai Logistics Expansion',
    customer: 'Reliance Industrial Infrastructure',
    category: 'Supply Chain & Freight',
    status: 'In Progress',
    progress: 68,
    currentPhase: 'Gantry & Fleet Testing',
    velocity: 'Ahead of schedule',
    manager: 'Prateek Kulkarni',
    startDate: '12 Jul 2026',
    expectedCompletion: '30 Nov 2026',
    budget: '₹74,00,000',
    lastUpdated: 'Today',
    milestonesCount: 6,
    completedMilestones: 4,
    locationsCount: 4,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-mle-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Maharashtra',
        city: 'Mumbai',
        phase: 'Gantry Commissioning',
        status: 'In Progress',
        progress: 70,
        assignedTeam: 'Konkan Logistics Tech',
        lastUpdated: 'Today'
      }
    ]
  },
  {
    id: 'prj-bengaluru-plant',
    code: 'BPM',
    name: 'Bengaluru Plant Modernization',
    customer: 'Bharat Heavy Electricals (BHEL)',
    category: 'Heavy Manufacturing',
    status: 'In Progress',
    progress: 74,
    currentPhase: 'Substation Installation',
    velocity: 'Stable throughput',
    manager: 'Sowmya Rao',
    startDate: '05 Jun 2026',
    expectedCompletion: '18 Dec 2026',
    budget: '₹62,00,000',
    lastUpdated: 'Today',
    milestonesCount: 5,
    completedMilestones: 3,
    locationsCount: 3,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-bpm-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Karnataka',
        city: 'Bengaluru',
        phase: 'Substation Sync',
        status: 'In Progress',
        progress: 75,
        assignedTeam: 'Deccan Grid Engineering',
        lastUpdated: 'Today'
      }
    ]
  },
  {
    id: 'prj-pune-mfg',
    code: 'PMI',
    name: 'Pune Manufacturing Integration',
    customer: 'Mahindra Automation Systems',
    category: 'Automotive Automation',
    status: 'In Progress',
    progress: 55,
    currentPhase: 'Robotics Calibration',
    velocity: 'Calibrating multi-axis arms',
    manager: 'Tanmay Joshi',
    startDate: '18 Aug 2026',
    expectedCompletion: '10 Jan 2027',
    budget: '₹49,00,000',
    lastUpdated: 'Yesterday',
    milestonesCount: 5,
    completedMilestones: 2,
    locationsCount: 3,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-pmi-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Maharashtra',
        city: 'Pune',
        phase: 'Articulated Arm Wiring',
        status: 'In Progress',
        progress: 55,
        assignedTeam: 'Chakan Robotics Guild',
        lastUpdated: 'Yesterday'
      }
    ]
  },
  {
    id: 'prj-gurugram-auto',
    code: 'GWA',
    name: 'Gurugram Warehouse Automation',
    customer: 'Maruti Suzuki',
    category: 'Warehouse Robotics',
    status: 'In Progress',
    progress: 88,
    currentPhase: 'Conveyor Sync',
    velocity: 'Nearing production launch',
    manager: 'Amitabh Verma',
    startDate: '10 May 2026',
    expectedCompletion: '25 Oct 2026',
    budget: '₹58,00,000',
    lastUpdated: 'Today',
    milestonesCount: 5,
    completedMilestones: 4,
    locationsCount: 2,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-gwa-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Haryana',
        city: 'Gurugram',
        phase: 'Optical Sortation Test',
        status: 'In Progress',
        progress: 88,
        assignedTeam: 'Capital Automation Group',
        lastUpdated: 'Today'
      }
    ]
  },
  {
    id: 'prj-kolkata-rail',
    code: 'KRF',
    name: 'Kolkata Rail Fleet Automation',
    customer: 'JSW Infrastructure',
    category: 'Transit & Rail Systems',
    status: 'In Progress',
    progress: 42,
    currentPhase: 'Trackside Sensor Mount',
    velocity: 'Field integration active',
    manager: 'Soumya Banerjee',
    startDate: '14 Jul 2026',
    expectedCompletion: '15 Jan 2027',
    budget: '₹66,00,000',
    lastUpdated: '10 Sep',
    milestonesCount: 6,
    completedMilestones: 2,
    locationsCount: 3,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-krf-1',
        country: 'India',
        countryCode: 'IN',
        state: 'West Bengal',
        city: 'Kolkata',
        phase: 'Sensor Array Cabling',
        status: 'In Progress',
        progress: 42,
        assignedTeam: 'Eastern Transit Systems',
        lastUpdated: '10 Sep'
      }
    ]
  },
  {
    id: 'prj-chennai-robotics',
    code: 'CRI',
    name: 'Chennai Robotics Installation',
    customer: 'Larsen & Toubro',
    category: 'Assembly Line Robotics',
    status: 'Delivered',
    progress: 100,
    currentPhase: 'Handover Completed',
    velocity: 'Production certified',
    manager: 'Suresh Ramanathan',
    startDate: '01 Mar 2026',
    expectedCompletion: '04 Sep 2026',
    budget: '₹82,00,000',
    lastUpdated: '04 Sep',
    milestonesCount: 6,
    completedMilestones: 6,
    locationsCount: 4,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-cri-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Tamil Nadu',
        city: 'Chennai',
        phase: 'Factory Acceptance Certified',
        status: 'Completed',
        progress: 100,
        assignedTeam: 'Coromandel Industrial Tech',
        lastUpdated: '04 Sep'
      }
    ]
  },
  {
    id: 'prj-hyderabad-infra',
    code: 'HID',
    name: 'Hyderabad Infrastructure Deployment',
    customer: 'Infosys',
    category: 'Enterprise Campus IT & IoT',
    status: 'Completed',
    progress: 100,
    currentPhase: 'Final Sign-off',
    velocity: 'Full system online',
    manager: 'Nithya Reddy',
    startDate: '15 Feb 2026',
    expectedCompletion: '06 Sep 2026',
    budget: '₹54,00,000',
    lastUpdated: '06 Sep',
    milestonesCount: 5,
    completedMilestones: 5,
    locationsCount: 3,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-hid-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Telangana',
        city: 'Hyderabad',
        phase: 'Campus Mesh Validation',
        status: 'Completed',
        progress: 100,
        assignedTeam: 'Cyberabad Works Group',
        lastUpdated: '06 Sep'
      }
    ]
  },
  {
    id: 'prj-noida-dc',
    code: 'NDU',
    name: 'Noida Data Centre Upgrade',
    customer: 'Tata Consultancy Services',
    category: 'Mission-Critical Power & HVAC',
    status: 'Delivered',
    progress: 100,
    currentPhase: 'Tier-4 Operational',
    velocity: 'Passed load banking test',
    manager: 'Rajeev Malhotra',
    startDate: '10 Jan 2026',
    expectedCompletion: '07 Sep 2026',
    budget: '₹95,00,000',
    lastUpdated: '07 Sep',
    milestonesCount: 7,
    completedMilestones: 7,
    locationsCount: 3,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-ndu-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Uttar Pradesh',
        city: 'Noida',
        phase: 'Dual UPS Load Switchover',
        status: 'Completed',
        progress: 100,
        assignedTeam: 'National Infrastructure Division',
        lastUpdated: '07 Sep'
      }
    ]
  },
  {
    id: 'prj-gujarat-terminal',
    code: 'GCT',
    name: 'Gujarat Coastal Terminal',
    customer: 'Adani Logistics & Ports',
    category: 'Bulk Conveyor Systems',
    status: 'At Risk',
    progress: 32,
    currentPhase: 'Hydraulic Rig Stoppage',
    velocity: 'Delayed by parts delivery',
    manager: 'Bhavin Shah',
    startDate: '15 Jun 2026',
    expectedCompletion: '20 Nov 2026',
    budget: '₹67,00,000',
    lastUpdated: 'Today',
    milestonesCount: 5,
    completedMilestones: 1,
    locationsCount: 2,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-gct-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Gujarat',
        city: 'Mundra',
        phase: 'Rig Valve Replacement',
        status: 'Critical',
        progress: 32,
        assignedTeam: 'Kutch Port Engineers',
        lastUpdated: 'Today'
      }
    ]
  },
  {
    id: 'prj-bengaluru-cloud',
    code: 'BCH',
    name: 'Bengaluru Cloud Hub',
    customer: 'Infosys',
    category: 'Optical Networking',
    status: 'On Hold',
    progress: 18,
    currentPhase: 'Awaiting Vendor Parts',
    velocity: 'Suspended pending ASIC release',
    manager: 'Shalini Narayanan',
    startDate: '01 Jul 2026',
    expectedCompletion: '30 Dec 2026',
    budget: '₹43,00,000',
    lastUpdated: '08 Sep',
    milestonesCount: 4,
    completedMilestones: 1,
    locationsCount: 2,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-bch-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Karnataka',
        city: 'Bengaluru',
        phase: 'Fibre Optic Duct Pull',
        status: 'On Hold',
        progress: 18,
        assignedTeam: 'Silicon Valley Network Ops',
        lastUpdated: '08 Sep'
      }
    ]
  },
  {
    id: 'prj-mumbai-metro',
    code: 'MMS',
    name: 'Mumbai Metro Signaling Phase 2',
    customer: 'Reliance Industrial Infrastructure',
    category: 'CBTC Railway Signaling',
    status: 'At Risk',
    progress: 28,
    currentPhase: 'Track Access Clearance',
    velocity: 'Permit review pending with MMRDA',
    manager: 'Girish Sawant',
    startDate: '20 May 2026',
    expectedCompletion: '15 Nov 2026',
    budget: '₹79,00,000',
    lastUpdated: 'Yesterday',
    milestonesCount: 6,
    completedMilestones: 1,
    locationsCount: 4,
    countriesCount: 1,
    locations: [
      {
        id: 'loc-mms-1',
        country: 'India',
        countryCode: 'IN',
        state: 'Maharashtra',
        city: 'Mumbai',
        phase: 'Interlocking Server Config',
        status: 'Critical',
        progress: 28,
        assignedTeam: 'Metro Signaling Experts',
        lastUpdated: 'Yesterday'
      }
    ]
  }
];

export const INITIAL_CRITICAL_SPARES: CriticalSpareItem[] = [
  {
    id: 'sp-1',
    partNumber: 'PLC-MOD-994',
    name: 'Optic Servo Controller',
    category: 'Automation IC',
    stock: 2,
    qty: 2,
    minThreshold: 8,
    status: 'Critical',
    unitCost: '₹1,450',
    supplier: 'Siemens Precision',
    leadTimeDays: 4,
    serialNo: 'SN-849204-A',
    hwIdentifier: 'HW-SRV-900',
    modelNo: 'MDL-994-X',
    family: 'Automation',
    city: 'Gurugram',
    state: 'Haryana',
    projectId: 'PRJ-0082',
    projectTitle: 'Project Alpha'
  },
  {
    id: 'sp-2',
    partNumber: 'ENC-ROT-400',
    name: 'Optical Rotary Encoder',
    category: 'Sensors',
    stock: 1,
    qty: 1,
    minThreshold: 5,
    status: 'Critical',
    unitCost: '₹380',
    supplier: 'Heidenhain Direct',
    leadTimeDays: 3,
    serialNo: 'SN-930192-B',
    hwIdentifier: 'HW-ENC-400',
    modelNo: 'MDL-ROT-40',
    family: 'Sensors',
    city: 'Kolkata',
    state: 'West Bengal',
    projectId: 'PRJ-0083',
    projectTitle: 'Project Beta'
  },
  {
    id: 'sp-3',
    partNumber: 'VFD-PWR-820',
    name: 'Variable Frequency Drive 15kW',
    category: 'Power Units',
    stock: 0,
    qty: 0,
    minThreshold: 3,
    status: 'Critical',
    unitCost: '₹2,890',
    supplier: 'ABB Industrial',
    leadTimeDays: 6,
    serialNo: 'SN-294012-C',
    hwIdentifier: 'HW-VFD-820',
    modelNo: 'MDL-PWR-15',
    family: 'Power Units',
    city: 'Bengaluru',
    state: 'Karnataka',
    projectId: 'PRJ-0084',
    projectTitle: 'Project Gamma'
  },
  {
    id: 'sp-4',
    partNumber: 'HYD-VAL-112',
    name: 'Proportional Hydraulic Valve',
    category: 'Fluid Dynamics',
    stock: 4,
    qty: 4,
    minThreshold: 10,
    status: 'Low Stock',
    unitCost: '₹620',
    supplier: 'Bosch Rexroth',
    leadTimeDays: 5,
    serialNo: 'SN-581903-D',
    hwIdentifier: 'HW-HYD-112',
    modelNo: 'MDL-FL-112',
    family: 'Fluid Dynamics',
    city: 'Hyderabad',
    state: 'Telangana',
    projectId: 'PRJ-0085',
    projectTitle: 'Project Delta'
  },
  {
    id: 'sp-5',
    partNumber: 'BRG-CER-882',
    name: 'Ceramic High-RPM Bearing',
    category: 'Mechanical',
    stock: 3,
    qty: 3,
    minThreshold: 8,
    status: 'Low Stock',
    unitCost: '₹195',
    supplier: 'SKF Global',
    leadTimeDays: 2,
    serialNo: 'SN-102948-E',
    hwIdentifier: 'HW-BRG-882',
    modelNo: 'MDL-CR-882',
    family: 'Mechanical',
    city: 'Chennai',
    state: 'Tamil Nadu',
    projectId: 'PRJ-0082',
    projectTitle: 'Project Alpha'
  },
  {
    id: 'sp-6',
    partNumber: 'FUS-SEM-050',
    name: 'Semiconductor Fast-Blow Fuse',
    category: 'Electrical',
    stock: 6,
    qty: 6,
    minThreshold: 15,
    status: 'Low Stock',
    unitCost: '₹45',
    supplier: 'Bussmann Eaton',
    leadTimeDays: 1,
    serialNo: 'SN-773821-F',
    hwIdentifier: 'HW-FUS-050',
    modelNo: 'MDL-FB-050',
    family: 'Electrical',
    city: 'Mumbai',
    state: 'Maharashtra',
    projectId: 'PRJ-0086',
    projectTitle: 'Project Epsilon'
  },
  {
    id: 'sp-7',
    partNumber: 'TER-BLK-500',
    name: 'Spring Terminal Rail Block',
    category: 'Wiring',
    stock: 12,
    qty: 12,
    minThreshold: 25,
    status: 'Low Stock',
    unitCost: '₹18',
    supplier: 'WAGO Controls',
    leadTimeDays: 2,
    serialNo: 'SN-449102-G',
    hwIdentifier: 'HW-TER-500',
    modelNo: 'MDL-TR-500',
    family: 'Wiring',
    city: 'Pune',
    state: 'Maharashtra',
    projectId: 'PRJ-0083',
    projectTitle: 'Project Beta'
  },
  {
    id: 'sp-8',
    partNumber: 'REL-SST-024',
    name: 'Solid State Relay 24VDC',
    category: 'Electrical',
    stock: 5,
    qty: 5,
    minThreshold: 12,
    status: 'Low Stock',
    unitCost: '₹85',
    supplier: 'Omron Automation',
    leadTimeDays: 3,
    serialNo: 'SN-662819-H',
    hwIdentifier: 'HW-REL-024',
    modelNo: 'MDL-SS-024',
    family: 'Electrical',
    city: 'Ahmedabad',
    state: 'Gujarat',
    projectId: 'PRJ-0084',
    projectTitle: 'Project Gamma'
  },
  {
    id: 'sp-9',
    partNumber: 'PNE-CYL-080',
    name: 'ISO Guided Pneumatic Cylinder',
    category: 'Pneumatics',
    stock: 2,
    qty: 2,
    minThreshold: 6,
    status: 'Pending',
    unitCost: '₹310',
    supplier: 'Festo Systems',
    leadTimeDays: 7,
    serialNo: 'SN-339102-J',
    hwIdentifier: 'HW-PNE-080',
    modelNo: 'MDL-IG-080',
    family: 'Pneumatics',
    city: 'Jaipur',
    state: 'Rajasthan',
    projectId: 'PRJ-0085',
    projectTitle: 'Project Delta'
  },
  {
    id: 'sp-10',
    partNumber: 'CAB-ETH-CAT7',
    name: 'Shielded Industrial Ethernet Drum',
    category: 'Telecom',
    stock: 1,
    qty: 1,
    minThreshold: 4,
    status: 'Pending',
    unitCost: '₹490',
    supplier: 'Lapp Cable',
    leadTimeDays: 5,
    serialNo: 'SN-882710-K',
    hwIdentifier: 'HW-CAB-700',
    modelNo: 'MDL-EC-700',
    family: 'Telecom',
    city: 'Vadodara',
    state: 'Gujarat',
    projectId: 'PRJ-0086',
    projectTitle: 'Project Epsilon'
  },
  {
    id: 'sp-11',
    partNumber: 'TEM-RTD-PT100',
    name: 'Platinum RTD Temp Sensor',
    category: 'Sensors',
    stock: 3,
    qty: 3,
    minThreshold: 8,
    status: 'Pending',
    unitCost: '₹140',
    supplier: 'Endress+Hauser',
    leadTimeDays: 4,
    serialNo: 'SN-552918-L',
    hwIdentifier: 'HW-RTD-100',
    modelNo: 'MDL-PT-100',
    family: 'Sensors',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    projectId: 'PRJ-0082',
    projectTitle: 'Project Alpha'
  },
  {
    id: 'sp-12',
    partNumber: 'FLT-AIR-M14',
    name: 'HEPA Micron Intake Filter',
    category: 'Consumables',
    stock: 4,
    qty: 4,
    minThreshold: 10,
    status: 'Pending',
    unitCost: '₹110',
    supplier: 'Donaldson Torit',
    leadTimeDays: 3,
    serialNo: 'SN-119284-M',
    hwIdentifier: 'HW-FLT-014',
    modelNo: 'MDL-HP-014',
    family: 'Consumables',
    city: 'Gurugram',
    state: 'Haryana',
    projectId: 'PRJ-0083',
    projectTitle: 'Project Beta'
  },
  {
    id: 'sp-13',
    partNumber: 'MOT-STP-042',
    name: 'High-Torque NEMA Stepper Motor',
    category: 'Automation IC',
    stock: 8,
    qty: 8,
    minThreshold: 10,
    status: 'Normal',
    unitCost: '₹210',
    supplier: 'Oriental Motor',
    leadTimeDays: 3,
    serialNo: 'SN-729104-N',
    hwIdentifier: 'HW-STP-042',
    modelNo: 'MDL-ST-042',
    family: 'Automation',
    city: 'Kolkata',
    state: 'West Bengal',
    projectId: 'PRJ-0084',
    projectTitle: 'Project Gamma'
  },
  {
    id: 'sp-14',
    partNumber: 'SMR-BRK-220',
    name: 'Regenerative Braking Resistor',
    category: 'Power Units',
    stock: 5,
    qty: 5,
    minThreshold: 6,
    status: 'Normal',
    unitCost: '₹340',
    supplier: 'Danfoss Drives',
    leadTimeDays: 4,
    serialNo: 'SN-394812-P',
    hwIdentifier: 'HW-BRK-220',
    modelNo: 'MDL-RB-220',
    family: 'Power Units',
    city: 'Bengaluru',
    state: 'Karnataka',
    projectId: 'PRJ-0085',
    projectTitle: 'Project Delta'
  },
  {
    id: 'sp-15',
    partNumber: 'SMR-PRO-901',
    name: 'Laser Distance Measurement Head',
    category: 'Sensors',
    stock: 2,
    qty: 2,
    minThreshold: 4,
    status: 'Critical',
    unitCost: '₹1,820',
    supplier: 'Keyence Corp',
    leadTimeDays: 5,
    serialNo: 'SN-601924-Q',
    hwIdentifier: 'HW-LSR-901',
    modelNo: 'MDL-LD-901',
    family: 'Sensors',
    city: 'Vadodara',
    state: 'Gujarat',
    projectId: 'PRJ-0082',
    projectTitle: 'Project Alpha'
  },
  {
    id: 'sp-16',
    partNumber: 'VLV-SOL-024',
    name: 'Direct Acting Solenoid Manifold',
    category: 'Fluid Dynamics',
    stock: 7,
    qty: 7,
    minThreshold: 8,
    status: 'Normal',
    unitCost: '₹415',
    supplier: 'SMC Pneumatics',
    leadTimeDays: 2,
    serialNo: 'SN-481903-R',
    hwIdentifier: 'HW-SOL-024',
    modelNo: 'MDL-DA-024',
    family: 'Fluid Dynamics',
    city: 'Hyderabad',
    state: 'Telangana',
    projectId: 'PRJ-0086',
    projectTitle: 'Project Epsilon'
  },
  {
    id: 'sp-17',
    partNumber: 'CNT-AMP-100',
    name: 'Industrial Current Transducer',
    category: 'Electrical',
    stock: 9,
    qty: 9,
    minThreshold: 10,
    status: 'Normal',
    unitCost: '₹160',
    supplier: 'LEM Electronics',
    leadTimeDays: 2,
    serialNo: 'SN-883912-S',
    hwIdentifier: 'HW-AMP-100',
    modelNo: 'MDL-CT-100',
    family: 'Electrical',
    city: 'Mumbai',
    state: 'Maharashtra',
    projectId: 'PRJ-0083',
    projectTitle: 'Project Beta'
  },
  {
    id: 'sp-18',
    partNumber: 'ROB-GRP-064',
    name: 'Pneumatic Parallel Micro-Gripper',
    category: 'Pneumatics',
    stock: 3,
    qty: 3,
    minThreshold: 5,
    status: 'Low Stock',
    unitCost: '₹580',
    supplier: 'Schunk Automation',
    leadTimeDays: 6,
    serialNo: 'SN-219482-T',
    hwIdentifier: 'HW-GRP-064',
    modelNo: 'MDL-MG-064',
    family: 'Pneumatics',
    city: 'Chennai',
    state: 'Tamil Nadu',
    projectId: 'PRJ-0084',
    projectTitle: 'Project Gamma'
  },
  {
    id: 'sp-19',
    partNumber: 'PWR-SMP-024',
    name: 'Redundant DIN Power Supply 24V 20A',
    category: 'Power Units',
    stock: 5,
    qty: 5,
    minThreshold: 8,
    status: 'Low Stock',
    unitCost: '₹275',
    supplier: 'PULS Power',
    leadTimeDays: 3,
    serialNo: 'SN-948102-U',
    hwIdentifier: 'HW-PWR-024',
    modelNo: 'MDL-PS-024',
    family: 'Power Units',
    city: 'Ahmedabad',
    state: 'Gujarat',
    projectId: 'PRJ-0082',
    projectTitle: 'Project Alpha'
  },
  {
    id: 'sp-20',
    partNumber: 'SEN-PRX-M18',
    name: 'Inductive Proximity Sensor M18',
    category: 'Sensors',
    stock: 14,
    qty: 14,
    minThreshold: 20,
    status: 'Normal',
    unitCost: '₹65',
    supplier: 'Turck Banner',
    leadTimeDays: 1,
    serialNo: 'SN-158293-V',
    hwIdentifier: 'HW-PRX-M18',
    modelNo: 'MDL-IX-M18',
    family: 'Sensors',
    city: 'Jaipur',
    state: 'Rajasthan',
    projectId: 'PRJ-0085',
    projectTitle: 'Project Delta'
  },
  {
    id: 'sp-21',
    partNumber: 'PLC-CPU-1515',
    name: 'Failsafe Advanced CPU Controller',
    category: 'Automation IC',
    stock: 1,
    qty: 1,
    minThreshold: 4,
    status: 'Critical',
    unitCost: '₹3,400',
    supplier: 'Siemens Precision',
    leadTimeDays: 8,
    serialNo: 'SN-784019-W',
    hwIdentifier: 'HW-CPU-151',
    modelNo: 'MDL-FS-151',
    family: 'Automation',
    city: 'Vadodara',
    state: 'Gujarat',
    projectId: 'PRJ-0083',
    projectTitle: 'Project Beta'
  },
  {
    id: 'sp-22',
    partNumber: 'OPT-FBR-PATCH',
    name: 'Armored Multi-Mode Fiber Patch Cord',
    category: 'Telecom',
    stock: 18,
    qty: 18,
    minThreshold: 25,
    status: 'Normal',
    unitCost: '₹32',
    supplier: 'Corning Optical',
    leadTimeDays: 2,
    serialNo: 'SN-329104-X',
    hwIdentifier: 'HW-FBR-010',
    modelNo: 'MDL-MM-010',
    family: 'Telecom',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    projectId: 'PRJ-0086',
    projectTitle: 'Project Epsilon'
  },
  {
    id: 'sp-23',
    partNumber: 'VAL-SAF-050',
    name: 'Emergency Pressure Relief Safety Valve',
    category: 'Fluid Dynamics',
    stock: 2,
    qty: 2,
    minThreshold: 5,
    status: 'Critical',
    unitCost: '₹890',
    supplier: 'Swagelok Fluidics',
    leadTimeDays: 5,
    serialNo: 'SN-664910-Y',
    hwIdentifier: 'HW-VAL-050',
    modelNo: 'MDL-PR-050',
    family: 'Fluid Dynamics',
    city: 'Pune',
    state: 'Maharashtra',
    projectId: 'PRJ-0082',
    projectTitle: 'Project Alpha'
  },
  {
    id: 'sp-24',
    partNumber: 'FAN-SRV-120',
    name: 'Dual Ball-Bearing Chassis Blower',
    category: 'Mechanical',
    stock: 11,
    qty: 11,
    minThreshold: 15,
    status: 'Normal',
    unitCost: '₹58',
    supplier: 'EBM-Papst',
    leadTimeDays: 2,
    serialNo: 'SN-559102-Z',
    hwIdentifier: 'HW-FAN-120',
    modelNo: 'MDL-BL-120',
    family: 'Mechanical',
    city: 'Gurugram',
    state: 'Haryana',
    projectId: 'PRJ-0084',
    projectTitle: 'Project Gamma'
  }
];

export const INITIAL_TICKETS: SupportTicketItem[] = [
  {
    id: 'tkt-1',
    ticketNumber: 'TK-8821',
    title: 'Emergency servo trip on Line 4 Delhi',
    description: 'High thermal overload detected on axis 4 servo drive during continuous 80Nm high-speed torque cycle. The drive went into safety cut-off mode.',
    project: 'Project Zephyr',
    priority: 'Critical',
    status: 'Open',
    assignee: 'Rajesh Sharma',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 16, 2026 · 14:10',
    attachment: {
      name: 'servo_line4_telemetry_dump.pdf',
      size: '2.4 MB',
      type: 'PDF'
    }
  },
  {
    id: 'tkt-2',
    ticketNumber: 'TK-8819',
    title: 'Overheating telemetry alarm in Bengaluru rack',
    description: 'Ambient temp in enclosure C3 reached 54°C exceeding the 45°C operational threshold. Primary exhaust fan tachometer reading 0 RPM.',
    project: 'Project Zephyr',
    priority: 'Critical',
    status: 'Open',
    assignee: 'Harish Wankhede',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Sep 16, 2026 · 13:25',
    attachment: {
      name: 'thermal_scan_bengaluru_c3.pdf',
      size: '1.8 MB',
      type: 'PDF'
    }
  },
  {
    id: 'tkt-3',
    ticketNumber: 'TK-8815',
    title: 'CANbus synchronization drop out on PLC node 12',
    description: 'Periodic packet drop between master industrial gateway and remote I/O slice bus coupler. Frame loss rate spikes to 14% intermittently.',
    project: 'Project Atlas',
    priority: 'Critical',
    status: 'Open',
    assignee: 'Kavita Nair',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 16, 2026 · 11:45',
    attachment: {
      name: 'canbus_analyzer_capture.pcap',
      size: '4.2 MB',
      type: 'PCAP'
    }
  },
  {
    id: 'tkt-4',
    ticketNumber: 'TK-8809',
    title: 'Power rail fuse blown during peak shift',
    description: '24V DC auxiliary power bus fuse F12 failed upon cold reboot of machine cell 2. Replacement fuse blew after 4 minutes of activation.',
    project: 'Project Nova',
    priority: 'Critical',
    status: 'In Progress',
    assignee: 'Karan Singhania',
    manager: 'Aarav Mehta',
    managerEmail: 'a.mehta@pseudoteam.in',
    createdDate: 'Sep 16, 2026 · 09:15'
  },
  {
    id: 'tkt-5',
    ticketNumber: 'TK-8798',
    title: 'Firmware patch 4.2 staging sign-off validation',
    description: 'Verify field safety checksums and redundant communication watchdogs on industrial automation stack prior to rolling out across 40 lines.',
    project: 'Project Zephyr',
    priority: 'High',
    status: 'Open',
    assignee: 'Vaniya Batra',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 15, 2026 · 17:30',
    attachment: {
      name: 'firmware_validation_manifest.pdf',
      size: '3.1 MB',
      type: 'PDF'
    }
  },
  {
    id: 'tkt-6',
    ticketNumber: 'TK-8792',
    title: 'PLC ladder logic tweak for valve timing',
    description: 'Actuator dwell delay between vacuum seal stroke and pneumatic cylinder return needs adjustment from 350ms to 280ms to prevent bottleneck.',
    project: 'Project Zephyr',
    priority: 'Medium',
    status: 'Open',
    assignee: 'Ananya Patel',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Sep 15, 2026 · 16:10'
  },
  {
    id: 'tkt-7',
    ticketNumber: 'TK-8785',
    title: 'Pune cleanroom sensor calibration report',
    description: 'Laser particle sensor calibration drift detected during quarterly audit. Requires ISO 14644-1 certified zero-count recalibration verification.',
    project: 'Project Nova',
    priority: 'Medium',
    status: 'In Progress',
    assignee: 'Sneha Kulkarni',
    manager: 'Aarav Mehta',
    managerEmail: 'a.mehta@pseudoteam.in',
    createdDate: 'Sep 15, 2026 · 14:00',
    attachment: {
      name: 'aichi_iso_calibration.pdf',
      size: '1.2 MB',
      type: 'PDF'
    }
  },
  {
    id: 'tkt-8',
    ticketNumber: 'TK-8774',
    title: 'Routine weekly vibration spectrum analysis',
    description: 'Vibration monitoring on main feed blower shows slight harmonic elevation around 120Hz. Bearing lubrification inspection completed.',
    project: 'Project Orion',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Aarav Mehta',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 14, 2026 · 10:20',
    attachment: {
      name: 'spectrum_analysis_wk37.pdf',
      size: '2.7 MB',
      type: 'PDF'
    }
  },
  {
    id: 'tkt-9',
    ticketNumber: 'TK-8770',
    title: 'Secondary Ethernet ring switch link flap',
    description: 'Port 7 on managed switch SW-04 experiencing link-down events every 45 minutes under heavy SCADA broadcast load.',
    project: 'Project Alpha',
    priority: 'High',
    status: 'Open',
    assignee: 'Sneha Kulkarni',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 14, 2026 · 09:00'
  },
  {
    id: 'tkt-10',
    ticketNumber: 'TK-8765',
    title: 'HMI panel unresponsive touchscreen grid',
    description: 'Capacitive touch calibration in upper left quadrant of operator terminal 02 drifting when line heating units engage.',
    project: 'Project Beta',
    priority: 'Medium',
    status: 'Open',
    assignee: 'Harish Wankhede',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Sep 13, 2026 · 16:40'
  },
  {
    id: 'tkt-11',
    ticketNumber: 'TK-8761',
    title: 'Emergency stop circuit test failure on cell 4',
    description: 'Dual channel E-stop safety relay tripped discrepancy alarm during monthly safety walk. Channel B contact resistance high.',
    project: 'Project Gamma',
    priority: 'Critical',
    status: 'In Progress',
    assignee: 'Rajesh Sharma',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 13, 2026 · 11:15',
    attachment: {
      name: 'safety_circuit_test_report.pdf',
      size: '1.5 MB',
      type: 'PDF'
    }
  },
  {
    id: 'tkt-12',
    ticketNumber: 'TK-8758',
    title: 'Pressure relief valve setting calibration',
    description: 'Hydraulic accumulator manifold pressure relief valve threshold verify against revised operating spec of 210 bar.',
    project: 'Project Zephyr',
    priority: 'High',
    status: 'Open',
    assignee: 'Ananya Patel',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Sep 12, 2026 · 15:20'
  },
  {
    id: 'tkt-13',
    ticketNumber: 'TK-8752',
    title: 'Optical encoder signal noise on gantry crane',
    description: 'Differential quadrature encoder pulses show voltage spikes induced by nearby variable frequency motor drive cable conduit.',
    project: 'Project Delta',
    priority: 'High',
    status: 'Open',
    assignee: 'Karan Singhania',
    manager: 'Aarav Mehta',
    managerEmail: 'a.mehta@pseudoteam.in',
    createdDate: 'Sep 12, 2026 · 12:45'
  },
  {
    id: 'tkt-14',
    ticketNumber: 'TK-8749',
    title: 'Cooling jacket flow sensor erratic readouts',
    description: 'Magnetic inductive flow meter reporting intermittent 0 L/min flow during steady chiller recirculation cycles.',
    project: 'Project Epsilon',
    priority: 'Medium',
    status: 'In Progress',
    assignee: 'Vaniya Batra',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 11, 2026 · 14:10'
  },
  {
    id: 'tkt-15',
    ticketNumber: 'TK-8744',
    title: 'Safety interlock key exchange sequence timeout',
    description: 'Trapped key interlock mechanical switch solenoid fails to energize when safety lock solenoid timeout counter expires.',
    project: 'Project Alpha',
    priority: 'Critical',
    status: 'Open',
    assignee: 'Kavita Nair',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 11, 2026 · 10:30'
  },
  {
    id: 'tkt-16',
    ticketNumber: 'TK-8738',
    title: 'Pneumatic manifold pressure regulator leakage',
    description: 'Exhaust port on 6-valve manifold blowing air continuously while in standby mode, causing compressor cycle frequency to triple.',
    project: 'Project Zephyr',
    priority: 'Medium',
    status: 'Open',
    assignee: 'Harish Wankhede',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Sep 10, 2026 · 16:50'
  },
  {
    id: 'tkt-17',
    ticketNumber: 'TK-8732',
    title: 'Conveyor servo sync drift under heavy payload',
    description: 'Speed master-follower differential tracking error exceeds 1.5mm when carrying pallets exceeding 400kg.',
    project: 'Project Beta',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Rajesh Sharma',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 10, 2026 · 11:20'
  },
  {
    id: 'tkt-18',
    ticketNumber: 'TK-8728',
    title: 'Barcode scan engine optical focus deviation',
    description: 'Fixed-mount 2D matrix scanner failing 8% of read attempts on curved metal surfaces under high ambient sodium lighting.',
    project: 'Project Nova',
    priority: 'Low',
    status: 'Open',
    assignee: 'Sneha Kulkarni',
    manager: 'Aarav Mehta',
    managerEmail: 'a.mehta@pseudoteam.in',
    createdDate: 'Sep 09, 2026 · 13:15'
  },
  {
    id: 'tkt-19',
    ticketNumber: 'TK-8721',
    title: 'Uninterruptible power supply battery bank health check',
    description: 'UPS-03 cell internal resistance test showed cell #4 exceeds normal degradation curve. Replacement pack scheduled.',
    project: 'Project Orion',
    priority: 'Medium',
    status: 'In Progress',
    assignee: 'Karan Singhania',
    manager: 'Aarav Mehta',
    managerEmail: 'a.mehta@pseudoteam.in',
    createdDate: 'Sep 09, 2026 · 09:40'
  },
  {
    id: 'tkt-20',
    ticketNumber: 'TK-8715',
    title: 'Proximity sensor cable shielding mechanical wear',
    description: 'Cable drag chain inspection identified outer PVC jacket wear on proximity sensor harness for indexing carousel 1.',
    project: 'Project Gamma',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Ananya Patel',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Sep 08, 2026 · 15:00'
  },
  {
    id: 'tkt-21',
    ticketNumber: 'TK-8710',
    title: 'Hydraulic filter differential pressure switch trip',
    description: 'Return line 10-micron element loaded with particulate. Replaced filter cartridge and took oil sample for patch testing.',
    project: 'Project Atlas',
    priority: 'Medium',
    status: 'Resolved',
    assignee: 'Harish Wankhede',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 08, 2026 · 11:30'
  },
  {
    id: 'tkt-22',
    ticketNumber: 'TK-8705',
    title: 'Robotic end-effector vacuum gripper seal replacement',
    description: 'Suction cups on carton packing arm replaced with high-durability silicone cups after 150,000 cycles completed.',
    project: 'Project Delta',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Rajesh Sharma',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 07, 2026 · 14:15'
  },
  {
    id: 'tkt-23',
    ticketNumber: 'TK-8698',
    title: 'Control cabinet AC unit condensate drain clogged',
    description: 'Condensate drip tray drain tube cleared and cleaned with antimicrobial solution. Humidity in cabinet normalized to 42%.',
    project: 'Project Zephyr',
    priority: 'Medium',
    status: 'Resolved',
    assignee: 'Vaniya Batra',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Sep 07, 2026 · 10:00'
  },
  {
    id: 'tkt-24',
    ticketNumber: 'TK-8691',
    title: 'Thermocouple amplifier ground loop calibration',
    description: 'Isolated signal conditioner installed on thermocouple wire channel to eliminate 60Hz hum interference.',
    project: 'Project Nova',
    priority: 'High',
    status: 'Resolved',
    assignee: 'Sneha Kulkarni',
    manager: 'Aarav Mehta',
    managerEmail: 'a.mehta@pseudoteam.in',
    createdDate: 'Sep 06, 2026 · 16:30'
  },
  {
    id: 'tkt-25',
    ticketNumber: 'TK-8685',
    title: 'Main line torque limiter clutch disengagement test',
    description: 'Mechanical shear overload clutch tested with digital torque wrench and set precisely to 240 Nm manufacturer recommendation.',
    project: 'Project Alpha',
    priority: 'Medium',
    status: 'Resolved',
    assignee: 'Ananya Patel',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 05, 2026 · 13:40'
  },
  {
    id: 'tkt-26',
    ticketNumber: 'TK-8680',
    title: 'Industrial PC real-time clock battery exhaustion',
    description: 'CR2032 coin cell battery replaced on IPC motherboard during planned downtime maintenance window. BIOS clock synchronized via NTP.',
    project: 'Project Beta',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Harish Wankhede',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Sep 05, 2026 · 09:20'
  },
  {
    id: 'tkt-27',
    ticketNumber: 'TK-8675',
    title: 'Linear guide rail lubrication block replenishment',
    description: 'Automatic grease cartridge replaced on dual linear guides of XY staging table. Backlash measured at less than 0.02mm.',
    project: 'Project Gamma',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Karan Singhania',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 04, 2026 · 15:10'
  },
  {
    id: 'tkt-28',
    ticketNumber: 'TK-8670',
    title: 'Variable speed drive cooling fan bearing noise',
    description: 'Internal auxiliary fan on 75kW inverter replaced with dynamic ball bearing fan unit. Operating noise reduced by 12dB.',
    project: 'Project Orion',
    priority: 'Medium',
    status: 'Resolved',
    assignee: 'Rajesh Sharma',
    manager: 'Aarav Mehta',
    managerEmail: 'a.mehta@pseudoteam.in',
    createdDate: 'Sep 04, 2026 · 11:00'
  },
  {
    id: 'tkt-29',
    ticketNumber: 'TK-8664',
    title: 'Photoelectric safety light curtain optical alignment',
    description: 'Transmitter and receiver towers realigned after floor anchor realignment. Beam signal strength meter reads 100% across all 32 channels.',
    project: 'Project Atlas',
    priority: 'Critical',
    status: 'Resolved',
    assignee: 'Kavita Nair',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 03, 2026 · 14:50'
  },
  {
    id: 'tkt-30',
    ticketNumber: 'TK-8659',
    title: 'Ultrasonic tank level transmitter zero-point shift',
    description: 'Echo curve recalibrated for foam damping compensation. Vessel level reading verified with dip tape inspection.',
    project: 'Project Delta',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Vaniya Batra',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 03, 2026 · 10:20'
  },
  {
    id: 'tkt-31',
    ticketNumber: 'TK-8652',
    title: 'Solid state relay thermal interface pad renewal',
    description: 'Heatsink thermal grease replaced with high-conductivity phase change material for 3-phase heating element solid state contactor.',
    project: 'Project Epsilon',
    priority: 'Medium',
    status: 'Resolved',
    assignee: 'Ananya Patel',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Sep 02, 2026 · 16:15'
  },
  {
    id: 'tkt-32',
    ticketNumber: 'TK-8648',
    title: 'Motor brake gap air-gap wear measurement check',
    description: 'Electromagnetic spring-applied brake disc air gap verified within 0.35mm tolerance using precision feeler gauge set.',
    project: 'Project Zephyr',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Harish Wankhede',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 02, 2026 · 11:40'
  },
  {
    id: 'tkt-33',
    ticketNumber: 'TK-8641',
    title: 'Process water conductivity probe cleaning cycle',
    description: 'Toroidal conductivity cell acid-washed to remove scale buildup. Cell constant verified with NIST-traceable calibration standard.',
    project: 'Project Nova',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Sneha Kulkarni',
    manager: 'Aarav Mehta',
    managerEmail: 'a.mehta@pseudoteam.in',
    createdDate: 'Sep 01, 2026 · 15:30'
  },
  {
    id: 'tkt-34',
    ticketNumber: 'TK-8636',
    title: 'Fiber optic splice tray enclosure moisture seal audit',
    description: 'Outdoor fiber optic splice closure O-ring inspected, silicone grease applied, and desiccant pack refreshed.',
    project: 'Project Alpha',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Karan Singhania',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Sep 01, 2026 · 09:10'
  },
  {
    id: 'tkt-35',
    ticketNumber: 'TK-8630',
    title: 'Safety valve discharge piping hanger adjustment',
    description: 'Spring hanger tension on safety relief exhaust line adjusted to compensate for thermal pipe growth during purge cycles.',
    project: 'Project Beta',
    priority: 'Medium',
    status: 'Resolved',
    assignee: 'Aarav Mehta',
    manager: 'Vikramaditya Rao',
    managerEmail: 'v.rao@pseudoteam.in',
    createdDate: 'Aug 31, 2026 · 13:20'
  },
  {
    id: 'tkt-36',
    ticketNumber: 'TK-8625',
    title: 'Clean dry air supply dewpoint sensor verification',
    description: 'Chilled mirror hygrometer audit confirmed main plant instrument air dewpoint remains steady at -40°C ISO Class 2 standard.',
    project: 'Project Orion',
    priority: 'Low',
    status: 'Resolved',
    assignee: 'Rajesh Sharma',
    manager: 'Kavita Nair',
    managerEmail: 'k.nair@pseudoteam.in',
    createdDate: 'Aug 30, 2026 · 10:45',
    attachment: {
      name: 'air_quality_dewpoint_audit.pdf',
      size: '1.9 MB',
      type: 'PDF'
    }
  }
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    orderNumber: '#1024',
    itemsCount: 3,
    status: 'Processing',
    date: 'Today',
    totalAmount: '₹4,350',
    vendor: 'Siemens Industrial Corp',
    itemsDetail: ['S7-1500 PLC CPU Module (x1)', 'DI 16x24VDC Digital Input Module (x2)'],
    trackingNumber: 'TRK-984210-SIEM',
    shippingAddress: 'Bay 4, Plant Automation Facility, Bengaluru, KA'
  },
  {
    id: 'ord-2',
    orderNumber: '#1023',
    itemsCount: 5,
    status: 'Delivered',
    date: '12 Sep',
    totalAmount: '₹8,920',
    vendor: 'Festo Automation Inc',
    itemsDetail: ['MPA-S Valve Terminal (x2)', 'Pneumatic Actuator DSNU-25 (x3)'],
    trackingNumber: 'TRK-984019-FEST',
    shippingAddress: 'Bay 4, Plant Automation Facility, Bengaluru, KA'
  },
  {
    id: 'ord-3',
    orderNumber: '#1022',
    itemsCount: 2,
    status: 'Pending',
    date: '10 Sep',
    totalAmount: '₹1,870',
    vendor: 'Bosch Rexroth Direct',
    itemsDetail: ['Proportional Pressure Regulating Valve (x1)', 'High-Pressure Hydraulic Seal Kit (x1)'],
    trackingNumber: 'TRK-983870-BOSH',
    shippingAddress: 'Bay 2, Main Manufacturing Floor, Mumbai, MH'
  },
  {
    id: 'ord-4',
    orderNumber: '#1021',
    itemsCount: 4,
    status: 'Delivered',
    date: '08 Sep',
    totalAmount: '₹6,400',
    vendor: 'ABB Power Products',
    itemsDetail: ['ACS880 Industrial Inverter Drive 15kW (x1)', 'Braking Chopper Module (x1)', 'Line Choke 3-Phase (x2)'],
    trackingNumber: 'TRK-983652-ABBP',
    shippingAddress: 'Bay 4, Plant Automation Facility, Bengaluru, KA'
  },
  {
    id: 'ord-5',
    orderNumber: '#1020',
    itemsCount: 1,
    status: 'Cancelled',
    date: '05 Sep',
    totalAmount: '₹1,200',
    vendor: 'Rockwell Automation',
    itemsDetail: ['Allen-Bradley 1756-L83E GuardLogix Controller (x1)'],
    trackingNumber: 'TRK-CANCELLED',
    shippingAddress: 'Warehouse A, Staging Dock 3, Delhi NCR, DL'
  },
  {
    id: 'ord-6',
    orderNumber: '#1019',
    itemsCount: 6,
    status: 'Delivered',
    date: '03 Sep',
    totalAmount: '₹12,450',
    vendor: 'Schneider Electric',
    itemsDetail: ['Modicon M580 ePAC Processor (x2)', 'Ethernet RIO Drop Adapter (x4)'],
    trackingNumber: 'TRK-982941-SCHN',
    shippingAddress: 'Assembly Line 3, Cleanroom Lab, Pune, MH'
  },
  {
    id: 'ord-7',
    orderNumber: '#1018',
    itemsCount: 3,
    status: 'Processing',
    date: '31 Aug',
    totalAmount: '₹3,180',
    vendor: 'Omron Electronics',
    itemsDetail: ['E3Z-D62 Compact Photoelectric Sensor (x8)', 'Safety Interlock Switch D4SL-N (x2)'],
    trackingNumber: 'TRK-982510-OMRN',
    shippingAddress: 'Bay 2, Main Manufacturing Floor, Mumbai, MH'
  },
  {
    id: 'ord-8',
    orderNumber: '#1017',
    itemsCount: 4,
    status: 'Delivered',
    date: '28 Aug',
    totalAmount: '₹5,820',
    vendor: 'Phoenix Contact',
    itemsDetail: ['QUINT4 Power Supply 24V/20A (x2)', 'Industrial Managed Ethernet Switch (x2)'],
    trackingNumber: 'TRK-982144-PHNX',
    shippingAddress: 'Bay 4, Plant Automation Facility, Bengaluru, KA'
  },
  {
    id: 'ord-9',
    orderNumber: '#1016',
    itemsCount: 2,
    status: 'Pending',
    date: '24 Aug',
    totalAmount: '₹2,750',
    vendor: 'Beckhoff Automation',
    itemsDetail: ['CX5140 Embedded PC with EtherCAT (x1)', 'EL1809 16-channel Digital Input (x1)'],
    trackingNumber: 'TRK-981882-BCKF',
    shippingAddress: 'Control Center West, Hyderabad, TS'
  },
  {
    id: 'ord-10',
    orderNumber: '#1015',
    itemsCount: 3,
    status: 'Delivered',
    date: '20 Aug',
    totalAmount: '₹7,200',
    vendor: 'Siemens Industrial Corp',
    itemsDetail: ['SINAMICS S120 Motor Module (x1)', 'SMI24 Sensor Module (x2)'],
    trackingNumber: 'TRK-981420-SIEM',
    shippingAddress: 'Bay 4, Plant Automation Facility, Bengaluru, KA'
  },
  {
    id: 'ord-11',
    orderNumber: '#1014',
    itemsCount: 2,
    status: 'Cancelled',
    date: '17 Aug',
    totalAmount: '₹950',
    vendor: 'Festo Automation Inc',
    itemsDetail: ['Standard Cylinder DNC-50-100-PPV-A (x2)'],
    trackingNumber: 'TRK-CANCELLED',
    shippingAddress: 'Bay 2, Main Manufacturing Floor, Mumbai, MH'
  },
  {
    id: 'ord-12',
    orderNumber: '#1013',
    itemsCount: 5,
    status: 'Delivered',
    date: '14 Aug',
    totalAmount: '₹9,340',
    vendor: 'Bosch Rexroth Direct',
    itemsDetail: ['Linear Motion Slide Unit CKK-145 (x1)', 'IndraDrive Cs Servo Amplifier (x2)'],
    trackingNumber: 'TRK-980991-BOSH',
    shippingAddress: 'Assembly Line 3, Cleanroom Lab, Pune, MH'
  },
  {
    id: 'ord-13',
    orderNumber: '#1012',
    itemsCount: 4,
    status: 'Delivered',
    date: '10 Aug',
    totalAmount: '₹4,120',
    vendor: 'ABB Power Products',
    itemsDetail: ['AF Contactors 3-Pole 40A (x4)', 'Electronic Overload Relay EF19 (x4)'],
    trackingNumber: 'TRK-980512-ABBP',
    shippingAddress: 'Bay 4, Plant Automation Facility, Bengaluru, KA'
  },
  {
    id: 'ord-14',
    orderNumber: '#1011',
    itemsCount: 2,
    status: 'Processing',
    date: '06 Aug',
    totalAmount: '₹3,890',
    vendor: 'Rockwell Automation',
    itemsDetail: ['Kinetix 5500 Servo Drive 1.6kW (x1)', 'VPL Low-Inertia Servo Motor (x1)'],
    trackingNumber: 'TRK-980140-RCKW',
    shippingAddress: 'Bay 2, Main Manufacturing Floor, Mumbai, MH'
  },
  {
    id: 'ord-15',
    orderNumber: '#1010',
    itemsCount: 3,
    status: 'Delivered',
    date: '02 Aug',
    totalAmount: '₹5,150',
    vendor: 'Schneider Electric',
    itemsDetail: ['Altivar Process ATV630 Variable Speed Drive (x1)', 'Control Block Module (x2)'],
    trackingNumber: 'TRK-979802-SCHN',
    shippingAddress: 'Bay 4, Plant Automation Facility, Bengaluru, KA'
  },
  {
    id: 'ord-16',
    orderNumber: '#1009',
    itemsCount: 1,
    status: 'Delivered',
    date: '28 Jul',
    totalAmount: '₹2,100',
    vendor: 'Omron Electronics',
    itemsDetail: ['FZ5 High-Speed Industrial Vision Camera 2MP (x1)'],
    trackingNumber: 'TRK-979310-OMRN',
    shippingAddress: 'Assembly Line 3, Cleanroom Lab, Pune, MH'
  },
  {
    id: 'ord-17',
    orderNumber: '#1008',
    itemsCount: 3,
    status: 'Pending',
    date: '22 Jul',
    totalAmount: '₹3,400',
    vendor: 'Phoenix Contact',
    itemsDetail: ['MCR Signal Conditioners (x4)', 'VIP-PA Front Adapter Cable (x2)'],
    trackingNumber: 'TRK-978920-PHNX',
    shippingAddress: 'Control Center West, Hyderabad, TS'
  },
  {
    id: 'ord-18',
    orderNumber: '#1007',
    itemsCount: 4,
    status: 'Delivered',
    date: '15 Jul',
    totalAmount: '₹6,880',
    vendor: 'Beckhoff Automation',
    itemsDetail: ['CP2919 Multi-Touch Built-In Control Panel 19" (x1)', 'EtherCAT Coupler EK1100 (x2)'],
    trackingNumber: 'TRK-978401-BCKF',
    shippingAddress: 'Bay 4, Plant Automation Facility, Bengaluru, KA'
  }
];

export const INITIAL_EVENTS: CalendarEventItem[] = [
  {
    id: 'ev-1',
    time: '10:00 AM',
    title: 'Project Review',
    project: 'Project Alpha',
    type: 'review',
    date: '2026-09-15'
  },
  {
    id: 'ev-2',
    time: '02:00 PM',
    title: 'Maintenance Window',
    project: 'Project Beta',
    type: 'maintenance',
    date: '2026-09-15'
  },
  {
    id: 'ev-3',
    time: '11:00 AM',
    title: 'Client Meeting',
    project: 'Project Gamma',
    type: 'meeting',
    date: '2026-09-15'
  },
  {
    id: 'ev-4',
    time: '04:30 PM',
    title: 'Milestone Sign-off',
    project: 'Project Zephyr',
    type: 'milestone',
    date: '2026-09-16'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Critical Spare Requisition Approved',
    message: 'Purchase order #1024 for Optic Servo Controller was approved by finance.',
    time: '8m ago',
    read: false,
    type: 'order'
  },
  {
    id: 'notif-2',
    title: 'Project Zephyr Milestone Reached',
    message: 'Mumbai location marked Phase Commissioned as 100% Completed.',
    time: '34m ago',
    read: false,
    type: 'update'
  },
  {
    id: 'notif-3',
    title: 'Critical Ticket Assigned',
    message: 'TK-8821 assigned to Rajesh Sharma for Delhi Line 4 servo trip.',
    time: '1h ago',
    read: false,
    type: 'ticket'
  },
  {
    id: 'notif-4',
    title: 'Telemetry Alert',
    message: 'Gurugram site reported municipal permit hold status.',
    time: '4h ago',
    read: true,
    type: 'alert'
  }
];

export const INITIAL_CART: CartItem[] = [
  {
    id: 'cart-1',
    spareId: 'sp-1',
    partNumber: 'PLC-MOD-994',
    name: 'Optic Servo Controller',
    quantity: 2,
    unitPrice: 1450
  },
  {
    id: 'cart-2',
    spareId: 'sp-3',
    partNumber: 'VFD-PWR-820',
    name: 'Variable Frequency Drive 15kW',
    quantity: 1,
    unitPrice: 2890
  }
];

export const ensureLocationData = (
  project: ProjectItem,
  location: ProjectLocation
): { milestones: LocationMilestone[]; comments: LocationComment[] } => {
  if (location.milestones && location.milestones.length > 0 && location.comments && location.comments.length > 0) {
    return {
      milestones: location.milestones,
      comments: location.comments
    };
  }

  const milestones: LocationMilestone[] = location.milestones && location.milestones.length > 0 
    ? location.milestones 
    : [
        {
          id: `m-${location.id}-1`,
          name: `${location.city} Civil Prep & Sub-Base Anchor Inspection`,
          description: `Structural floor load verification, environmental sealed floor coating, and primary anchor bolt placement for ${location.city} facility.`,
          startDate: '10 May 2026',
          endDate: '02 Jun 2026',
          status: 'Completed',
          progress: 100
        },
        {
          id: `m-${location.id}-2`,
          name: 'Power Distribution & Industrial Telemetry Bus',
          description: `3-phase 480V substation installation and Profinet fiber optic backbone routing to ${location.city} cell enclosures.`,
          startDate: '05 Jun 2026',
          endDate: '28 Jun 2026',
          status: location.progress >= 40 ? 'Completed' : 'In Progress',
          progress: location.progress >= 40 ? 100 : Math.min(90, Math.round(location.progress * 2))
        },
        {
          id: `m-${location.id}-3`,
          name: 'Precision Automation & Cell Mechanism Assembly',
          description: `Mechanical mounting of automated robotic gantries, servo actuators, and end-effector tooling.`,
          startDate: '02 Jul 2026',
          endDate: '30 Jul 2026',
          status: location.progress >= 70 ? 'Completed' : location.progress >= 40 ? 'In Progress' : 'Pending',
          progress: location.progress >= 70 ? 100 : location.progress >= 40 ? 50 : 0
        },
        {
          id: `m-${location.id}-4`,
          name: 'Safety Interlocks, Optical Scanners & PLC Tuning',
          description: `BIS/PESO & ISO compliant light curtain barrier alignment and safety controller fail-safe simulation loops.`,
          startDate: '04 Aug 2026',
          endDate: '28 Aug 2026',
          status: location.progress >= 90 ? 'Completed' : location.progress >= 70 ? 'In Progress' : 'Pending',
          progress: location.progress >= 90 ? 100 : location.progress >= 70 ? 40 : 0
        },
        {
          id: `m-${location.id}-5`,
          name: 'Final Acceptance Testing (FAT) & Operational Handover',
          description: `Multi-shift sustained throughput burn-in test and stakeholder signoff for ${location.city} operations.`,
          startDate: '02 Sep 2026',
          endDate: '25 Sep 2026',
          status: location.progress === 100 ? 'Completed' : location.progress >= 85 ? 'In Progress' : 'Pending',
          progress: location.progress === 100 ? 100 : location.progress >= 85 ? 30 : 0
        }
      ];

  const comments: LocationComment[] = location.comments && location.comments.length > 0
    ? location.comments
    : [
        {
          id: `c-${location.id}-1`,
          author: 'Vaniya Batra',
          role: 'Lead Systems Architect',
          text: `Site telemetry active for ${location.city}. Automation cell controllers synchronized with central PseudoTeam gateway.`,
          timestamp: 'Today, 10:15 AM'
        },
        {
          id: `c-${location.id}-2`,
          author: location.assignedTeam ? `${location.assignedTeam} Lead` : 'Aarav Mehta',
          role: 'Field Operations',
          text: `Current phase ${location.phase} proceeding according to engineering roadmap for ${location.city}.`,
          timestamp: 'Yesterday, 03:30 PM'
        }
      ];

  return { milestones, comments };
};

// Explicit task database mapped to specific milestone IDs and dynamic generator for any milestone
export const MILESTONE_TASKS_DATABASE: Record<string, MilestoneTask[]> = {
  // Bengaluru (loc-3): Milestone 3 - Harmonic Drive & Servo Axis Installation
  'm-mun-3': [
    {
      id: 'tsk-mun-3-1',
      taskNumber: 'TASK 01',
      name: 'Sub-frame Harmonic Drive Alignment & Zero-Backlash Calibration',
      description: 'Zero-backlash dial test indicator measurement and micro-radian planetary gear backlash verification against ISO 9283 standard.',
      status: 'Completed',
      weightage: 20,
      progress: 100,
      startDate: '25 Jul 2026',
      endDate: '01 Aug 2026',
      assignee: 'Rajesh Iyer (Bharat Mechatronics)',
      activities: [
        {
          id: 'act-1',
          user: 'Vaniya Batra',
          role: 'Lead Systems Architect',
          text: 'Zero-backlash dial test indicator measurement verified. Radial runout within +/- 0.004mm tolerance.',
          timestamp: '28 Jul 2026, 11:20 AM',
          type: 'inspection'
        },
        {
          id: 'act-2',
          user: 'Rajesh Iyer',
          role: 'Lead Mechatronics Tech',
          text: 'Bengaluru Cleanroom Cell A harmonic gearbox sealed and preloaded to 35 Nm spec.',
          timestamp: '01 Aug 2026, 04:45 PM',
          type: 'status_change'
        }
      ]
    },
    {
      id: 'tsk-mun-3-2',
      taskNumber: 'TASK 02',
      name: 'Dual-Axis AC Servo Motor Mount & Planetary Gearbox Coupling',
      description: 'Mechanical mounting of brushless AC servo motors with absolute magnetic optical encoders and bellows coupling torquing.',
      status: 'Completed',
      weightage: 25,
      progress: 100,
      startDate: '02 Aug 2026',
      endDate: '09 Aug 2026',
      assignee: 'Lokesh Bhatt (Drive Systems)',
      activities: [
        {
          id: 'act-3',
          user: 'Lokesh Bhatt',
          role: 'Drive Specialist',
          text: 'Dual-axis coupling torque checked at 45 Nm using calibrated Norbar torque wrench. DIN 912 fastener locking paste applied.',
          timestamp: '07 Aug 2026, 02:15 PM',
          type: 'comment'
        },
        {
          id: 'act-4',
          user: 'Aarav Mehta',
          role: 'Quality Inspector',
          text: 'Motor phase continuity and optical encoder resolver feedback zero-point validated.',
          timestamp: '09 Aug 2026, 09:30 AM',
          type: 'approval'
        }
      ]
    },
    {
      id: 'tsk-mun-3-3',
      taskNumber: 'TASK 03',
      name: 'Cleanroom Low-Outgassing Cable Drag Chain & Routing',
      description: 'Installation of ISO Class 6 compliant energy chains with shielded motor power leads, resolver buses, and pneumatic airline bundles.',
      status: 'Completed',
      weightage: 15,
      progress: 100,
      startDate: '10 Aug 2026',
      endDate: '15 Aug 2026',
      assignee: 'Sunita Menon (Cleanroom Field Ops)',
      activities: [
        {
          id: 'act-5',
          user: 'Sunita Menon',
          role: 'Field Ops Lead',
          text: 'Low-outgassing e-chain populated with drag-chain rated PUR cabling. Bend radius limits strictly respected.',
          timestamp: '14 Aug 2026, 03:00 PM',
          type: 'comment'
        }
      ]
    },
    {
      id: 'tsk-mun-3-4',
      taskNumber: 'TASK 04',
      name: 'Multi-Axis Closed-Loop Motion Controller Kinematics Validation',
      description: 'Profinet IRT servo drive tuning, S-curve jerk limiting, and coordinated multi-axis trajectory profiling via central PseudoTeam controller.',
      status: 'Completed',
      weightage: 25,
      progress: 100,
      startDate: '16 Aug 2026',
      endDate: '22 Aug 2026',
      assignee: 'Vaniya Batra (Systems Architect)',
      activities: [
        {
          id: 'act-6',
          user: 'Vaniya Batra',
          role: 'Lead Systems Architect',
          text: 'Interpolated feed rates tested at 850 mm/s. Position following error remains under 12 encoder pulses under 100% payload.',
          timestamp: '21 Aug 2026, 06:10 PM',
          type: 'inspection'
        }
      ]
    },
    {
      id: 'tsk-mun-3-5',
      taskNumber: 'TASK 05',
      name: 'Dynamic Load Vibration Spectral Analysis & Thermal Run-in',
      description: 'Continuous 48-hour mechanical stress testing with triaxial accelerometer monitoring and thermal infrared imaging of harmonic gearing.',
      status: 'Completed',
      weightage: 15,
      progress: 100,
      startDate: '23 Aug 2026',
      endDate: '28 Aug 2026',
      assignee: 'Dr. Kaushik Raman (Vibration Engineering)',
      activities: [
        {
          id: 'act-7',
          user: 'Dr. Kaushik Raman',
          role: 'Vibration Analyst',
          text: 'FFT acceleration spectrum shows no resonance peaks across 0-2000 Hz. Max bearing housing temperature stabilized at 41.2°C.',
          timestamp: '27 Aug 2026, 05:40 PM',
          type: 'approval'
        },
        {
          id: 'act-8',
          user: 'Kavita Nair',
          role: 'Project Director',
          text: 'Milestone signoff approved. Bengaluru engineering team cleared to proceed with BIS compliance audit.',
          timestamp: '28 Aug 2026, 06:00 PM',
          type: 'approval'
        }
      ]
    }
  ],

  // Bengaluru (loc-3): Milestone 1 - Karnataka Environmental & Seismic Permitting
  'm-mun-1': [
    {
      id: 'tsk-mun-1-1',
      taskNumber: 'TASK 01',
      name: 'BBMP Municipal Building Code & Industrial Zoning Dossier Preparation',
      description: 'Compile architectural structural drawings and soil load capacities for Karnataka Industrial Areas Development Board (KIADB) registry.',
      status: 'Completed',
      weightage: 25,
      progress: 100,
      startDate: '15 May 2026',
      endDate: '22 May 2026',
      assignee: 'Sunita Menon',
      activities: [
        {
          id: 'act-m1-1',
          user: 'Sunita Menon',
          role: 'Regulatory Lead',
          text: 'Building dossier stamped by Bengaluru Metropolitan Development Board without caveats.',
          timestamp: '22 May 2026, 02:30 PM',
          type: 'approval'
        }
      ]
    },
    {
      id: 'tsk-mun-1-2',
      taskNumber: 'TASK 02',
      name: 'Geotechnical Seismic Load & Subsurface Vibration Testing',
      description: 'Field core boring and ground acceleration frequency response tests for high-precision robotic isolation.',
      status: 'Completed',
      weightage: 30,
      progress: 100,
      startDate: '23 May 2026',
      endDate: '31 May 2026',
      assignee: 'Dr. Kaushik Raman',
      activities: [
        {
          id: 'act-m1-2',
          user: 'Dr. Kaushik Raman',
          role: 'Geotech Engineer',
          text: 'Subsurface bedrock stability verified for 5000 kg dynamic payload.',
          timestamp: '31 May 2026, 04:15 PM',
          type: 'inspection'
        }
      ]
    },
    {
      id: 'tsk-mun-1-3',
      taskNumber: 'TASK 03',
      name: 'KSPCB Environmental Runoff & Industrial Effluent Drainage Review',
      description: 'Water discharge permits and secondary chemical containment basin certifications.',
      status: 'Completed',
      weightage: 25,
      progress: 100,
      startDate: '01 Jun 2026',
      endDate: '07 Jun 2026',
      assignee: 'Rajesh Iyer',
      activities: [
        {
          id: 'act-m1-3',
          user: 'Rajesh Iyer',
          role: 'Environmental Officer',
          text: 'Environmental compliance certificate issued by State Ministry.',
          timestamp: '07 Jun 2026, 11:00 AM',
          type: 'approval'
        }
      ]
    },
    {
      id: 'tsk-mun-1-4',
      taskNumber: 'TASK 04',
      name: 'Final City Council Permit Issuance & Official Archiving',
      description: 'Final administrative sign-off and registration in Bengaluru facility registry.',
      status: 'Completed',
      weightage: 20,
      progress: 100,
      startDate: '08 Jun 2026',
      endDate: '12 Jun 2026',
      assignee: 'Kavita Nair',
      activities: [
        {
          id: 'act-m1-4',
          user: 'Kavita Nair',
          role: 'Project Director',
          text: 'Permit fully executed and archived in PseudoTeam document repository.',
          timestamp: '12 Jun 2026, 05:00 PM',
          type: 'approval'
        }
      ]
    }
  ],

  // Bengaluru (loc-3): Milestone 2 - Cleanroom ISO-6 Enclosure Assembly
  'm-mun-2': [
    {
      id: 'tsk-mun-2-1',
      taskNumber: 'TASK 01',
      name: 'Modular Sealed Cleanroom Wall Panel & Air Shower Framing',
      description: 'Antistatic powder-coated aluminum honeycomb sandwich panel assembly with airtight silicon gaskets.',
      status: 'Completed',
      weightage: 25,
      progress: 100,
      startDate: '18 Jun 2026',
      endDate: '26 Jun 2026',
      assignee: 'Sunita Menon',
      activities: [
        {
          id: 'act-m2-1',
          user: 'Sunita Menon',
          role: 'Cleanroom Lead',
          text: 'Airtight enclosure pressure test passed at 30 Pa positive differential.',
          timestamp: '26 Jun 2026, 03:20 PM',
          type: 'inspection'
        }
      ]
    },
    {
      id: 'tsk-mun-2-2',
      taskNumber: 'TASK 02',
      name: 'HEPA FFU Ceiling Fan-Filter Unit Array Deployment',
      description: 'Installation and airflow balancing of 16 motorized H14 HEPA fan filter units.',
      status: 'Completed',
      weightage: 30,
      progress: 100,
      startDate: '27 Jun 2026',
      endDate: '07 Jul 2026',
      assignee: 'Lokesh Bhatt',
      activities: [
        {
          id: 'act-m2-2',
          user: 'Lokesh Bhatt',
          role: 'HVAC Specialist',
          text: 'FFU air velocity adjusted to 0.45 m/s across entire cleanroom grid.',
          timestamp: '07 Jul 2026, 01:10 PM',
          type: 'comment'
        }
      ]
    },
    {
      id: 'tsk-mun-2-3',
      taskNumber: 'TASK 03',
      name: 'Differential Pressure Sensor Loop & BMS Integration',
      description: 'BACnet pressure transducer wiring and automatic damper actuator calibration.',
      status: 'Completed',
      weightage: 25,
      progress: 100,
      startDate: '08 Jul 2026',
      endDate: '14 Jul 2026',
      assignee: 'Vaniya Batra',
      activities: [
        {
          id: 'act-m2-3',
          user: 'Vaniya Batra',
          role: 'Lead Systems Architect',
          text: 'Telemetry channel synced with PseudoTeam IoT gateway with 500ms polling interval.',
          timestamp: '14 Jul 2026, 04:00 PM',
          type: 'comment'
        }
      ]
    },
    {
      id: 'tsk-mun-2-4',
      taskNumber: 'TASK 04',
      name: 'Particle Counter ISO-14644 Airborne Contamination Certification',
      description: 'Laser aerosol particle counter audit confirming < 35,200 particles/m³ at 0.5 μm.',
      status: 'Completed',
      weightage: 20,
      progress: 100,
      startDate: '15 Jul 2026',
      endDate: '20 Jul 2026',
      assignee: 'Dr. Kaushik Raman',
      activities: [
        {
          id: 'act-m2-4',
          user: 'Dr. Kaushik Raman',
          role: 'Certification Specialist',
          text: 'ISO Class 6 formal certificate issued and counter calibrated.',
          timestamp: '20 Jul 2026, 05:30 PM',
          type: 'approval'
        }
      ]
    }
  ],

  // Bengaluru (loc-3): Milestone 4 - BIS & PESO Machinery Safety Compliance Certification
  'm-mun-4': [
    {
      id: 'tsk-mun-4-1',
      taskNumber: 'TASK 01',
      name: 'EN ISO 13849-1 Performance Level d (PLd) Functional Safety Architecture',
      description: 'Safety-related parts of control systems (SRP/CS) design validation and Sistema software evaluation.',
      status: 'Completed',
      weightage: 25,
      progress: 100,
      startDate: '02 Sep 2026',
      endDate: '08 Sep 2026',
      assignee: 'Rajesh Iyer',
      activities: [
        {
          id: 'act-m4-1',
          user: 'Rajesh Iyer',
          role: 'Safety Lead',
          text: 'Sistema report confirms PLd Category 3 compliance for optical safety interlocks.',
          timestamp: '08 Sep 2026, 02:40 PM',
          type: 'approval'
        }
      ]
    },
    {
      id: 'tsk-mun-4-2',
      taskNumber: 'TASK 02',
      name: 'Electromagnetic Compatibility (EMC) EN 61000-6-2 Radiated Emission Sweep',
      description: 'Chamber anechoic radiated RF emissions measurement under full 6-axis robot acceleration.',
      status: 'In Progress',
      weightage: 30,
      progress: 35,
      startDate: '09 Sep 2026',
      endDate: '16 Sep 2026',
      assignee: 'Vaniya Batra',
      activities: [
        {
          id: 'act-m4-2',
          user: 'Vaniya Batra',
          role: 'Lead Systems Architect',
          text: 'Initial sweep at 230 MHz identified minor harmonic noise on servo axis 3 power feed. Ferrite chokes added.',
          timestamp: '12 Sep 2026, 04:15 PM',
          type: 'comment'
        }
      ]
    },
    {
      id: 'tsk-mun-4-3',
      taskNumber: 'TASK 03',
      name: 'Dual-Channel E-Stop & Interlocked Access Guard Circuit Verification',
      description: 'Hardware trip point verification across cleanroom safety doors and light curtains.',
      status: 'At Risk',
      weightage: 20,
      progress: 0,
      startDate: '17 Sep 2026',
      endDate: '21 Sep 2026',
      assignee: 'Lokesh Bhatt',
      activities: [
        {
          id: 'act-m4-3',
          user: 'Lokesh Bhatt',
          role: 'Safety Tech',
          text: 'Replacement redundant safety relay module delayed from supplier. ETA 18 Sep.',
          timestamp: '16 Sep 2026, 09:00 AM',
          type: 'status_change'
        }
      ]
    },
    {
      id: 'tsk-mun-4-4',
      taskNumber: 'TASK 04',
      name: 'BIS Notified Body Technical Construction File (TCF) Submission',
      description: 'Final submission of machinery risk assessment and CE Declaration of Conformity dossier.',
      status: 'Pending',
      weightage: 25,
      progress: 0,
      startDate: '22 Sep 2026',
      endDate: '26 Sep 2026',
      assignee: 'Kavita Nair',
      activities: []
    }
  ],

  // Bengaluru (loc-3): Milestone 5 - Factory Acceptance Testing (FAT) with Client
  'm-mun-5': [
    {
      id: 'tsk-mun-5-1',
      taskNumber: 'TASK 01',
      name: 'Pre-FAT Test Procedure Protocol & Signoff Checklist Formulation',
      description: 'Develop multi-scenario failure and recovery testing matrices with ABC Corp engineering leads.',
      status: 'Pending',
      weightage: 20,
      progress: 0,
      startDate: '02 Oct 2026',
      endDate: '06 Oct 2026',
      assignee: 'Vaniya Batra',
      activities: []
    },
    {
      id: 'tsk-mun-5-2',
      taskNumber: 'TASK 02',
      name: 'Automated Pick-and-Place Cycle Time & Repeatability Trial',
      description: 'Continuous 10,000 cycle automated pick-and-place run at 1.2 second nominal cycle target.',
      status: 'Pending',
      weightage: 30,
      progress: 0,
      startDate: '07 Oct 2026',
      endDate: '12 Oct 2026',
      assignee: 'Rajesh Iyer',
      activities: []
    },
    {
      id: 'tsk-mun-5-3',
      taskNumber: 'TASK 03',
      name: 'Fault Injection Simulation & Emergency Power Cutover Protocol',
      description: 'Simulate utility blackout, pneumatic pressure drop, and emergency stop recovery without product loss.',
      status: 'Pending',
      weightage: 25,
      progress: 0,
      startDate: '13 Oct 2026',
      endDate: '17 Oct 2026',
      assignee: 'Lokesh Bhatt',
      activities: []
    },
    {
      id: 'tsk-mun-5-4',
      taskNumber: 'TASK 04',
      name: 'Client Stakeholder FAT Sign-Off & Official Plant Handover',
      description: 'Execution of formal acceptance protocols and handover of production keys and training documentation.',
      status: 'Pending',
      weightage: 25,
      progress: 0,
      startDate: '18 Oct 2026',
      endDate: '22 Oct 2026',
      assignee: 'Kavita Nair',
      activities: []
    }
  ]
};

// Helper to provide tasks for ANY milestone dynamically and deterministically
export const ensureMilestoneTasks = (
  milestone: LocationMilestone,
  location: ProjectLocation,
  project?: ProjectItem
): MilestoneTask[] => {
  // Check if explicitly defined in database
  if (MILESTONE_TASKS_DATABASE[milestone.id]) {
    return MILESTONE_TASKS_DATABASE[milestone.id];
  }

  // If milestone already holds tasks
  if (milestone.tasks && milestone.tasks.length > 0) {
    return milestone.tasks;
  }

  // Deterministically generate authentic tasks based on milestone status, name and dates
  const isCompleted = milestone.status === 'Completed' || milestone.progress === 100;
  const isInProgress = milestone.status === 'In Progress';

  const baseTasks: MilestoneTask[] = [
    {
      id: `tsk-${milestone.id}-1`,
      taskNumber: 'TASK 01',
      name: `Preliminary Engineering Review & CAD Model Verification for ${milestone.name}`,
      description: `Detailed cross-functional design review and FEA stress simulation sign-off for ${location.city} automation cells.`,
      status: isCompleted ? 'Completed' : isInProgress ? 'Completed' : 'Pending',
      weightage: 20,
      progress: isCompleted ? 100 : isInProgress ? 100 : 0,
      startDate: milestone.startDate,
      endDate: milestone.startDate,
      assignee: location.assignedTeam || 'Vaniya Batra',
      activities: [
        {
          id: `act-${milestone.id}-1`,
          user: 'Vaniya Batra',
          role: 'Lead Systems Architect',
          text: `CAD tolerance stackup verified against ${location.city} physical plant layout.`,
          timestamp: '03 days after start',
          type: 'approval'
        }
      ]
    },
    {
      id: `tsk-${milestone.id}-2`,
      taskNumber: 'TASK 02',
      name: `Sub-Assembly Mechanical Tooling & Sensor Mounting`,
      description: `Precision physical installation of pneumatic actuators, servo couplings, and optical feedback arrays.`,
      status: isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending',
      weightage: 25,
      progress: isCompleted ? 100 : isInProgress ? Math.min(90, Math.round(milestone.progress * 1.3)) : 0,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      assignee: location.assignedTeam || 'Field Operations Lead',
      activities: [
        {
          id: `act-${milestone.id}-2`,
          user: location.assignedTeam ? `${location.assignedTeam} Tech` : 'Aarav Mehta',
          role: 'Mechanical Field Lead',
          text: `Torque specifications met. Fasteners sealed and verified against engineering schedule.`,
          timestamp: 'Mid-milestone',
          type: 'comment'
        }
      ]
    },
    {
      id: `tsk-${milestone.id}-3`,
      taskNumber: 'TASK 03',
      name: `Electrical Harness Wiring & High-Speed Fieldbus Interconnect`,
      description: `Shielded 24V I/O bus termination, safety light curtain circuits, and industrial Ethernet gateway configuration.`,
      status: isCompleted ? 'Completed' : isInProgress ? (milestone.progress > 50 ? 'In Progress' : 'Pending') : 'Pending',
      weightage: 25,
      progress: isCompleted ? 100 : isInProgress ? Math.max(0, milestone.progress - 20) : 0,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      assignee: 'Vaniya Batra',
      activities: []
    },
    {
      id: `tsk-${milestone.id}-4`,
      taskNumber: 'TASK 04',
      name: `Automated PLC Motion Logic & Fault Containment Testing`,
      description: `Sequential logic cycle execution, dry run testing, and fail-safe automated abort routine validation.`,
      status: isCompleted ? 'Completed' : isInProgress ? (milestone.progress > 70 ? 'In Progress' : 'Pending') : 'Pending',
      weightage: 20,
      progress: isCompleted ? 100 : isInProgress ? Math.max(0, milestone.progress - 40) : 0,
      startDate: milestone.startDate,
      endDate: milestone.endDate,
      assignee: 'Controls Engineer Lead',
      activities: []
    },
    {
      id: `tsk-${milestone.id}-5`,
      taskNumber: 'TASK 05',
      name: `Quality Assurance Audit & Milestone Stage Sign-Off`,
      description: `Formal physical verification against client engineering specifications and PseudoTeam digital twin recording.`,
      status: isCompleted ? 'Completed' : 'Pending',
      weightage: 10,
      progress: isCompleted ? 100 : 0,
      startDate: milestone.endDate,
      endDate: milestone.endDate,
      assignee: project?.manager || 'Kavita Nair',
      activities: isCompleted
        ? [
            {
              id: `act-${milestone.id}-5`,
              user: project?.manager || 'Kavita Nair',
              role: 'Project Director',
              text: `Milestone verification gates cleared and audited for ${location.city}.`,
              timestamp: 'At completion',
              type: 'approval'
            }
          ]
        : []
    }
  ];

  return baseTasks;
};

