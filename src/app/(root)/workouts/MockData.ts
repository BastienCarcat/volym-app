import { Exercise } from "./types";

export const exercisesData: Exercise[] = [
  {
    id: "119cff6f-13b9-429b-87d9-9b06c3a8ae6f",
    name: "Bench Press (Barbell)",
    bodyPart: "Chest",
    image: "/barbell_bench_press.png",
    equipment: "Barbell",
    targetMuscles: [
      {
        id: "ffd76ee8-7633-4062-9c91-9092d637567a",
        name: "Pectoralis major",
        bodyPart: "Chest",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "dec5954e-80b5-493b-8911-a73ef54d96ee",
        name: "Triceps brachii",
        bodyPart: "Arms",
        group: null,
      },
      {
        id: "d0f075f6-831c-43b9-9749-15e1b74987be",
        name: "Deltoid",
        bodyPart: "Shoulders",
        group: null,
      },
    ],
  },
  {
    id: "ca1028c2-21c7-4c50-b824-a89678c6f1ef",
    name: "Squat (Barbell)",
    bodyPart: "Legs",
    image: "/barbell_bench_press.png",
    equipment: "Barbell",
    targetMuscles: [
      {
        id: "quad-1",
        name: "Quadriceps",
        bodyPart: "Legs",
        group: null,
      },
      {
        id: "glutes-1",
        name: "Glutes",
        bodyPart: "Legs",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "ham-1",
        name: "Hamstrings",
        bodyPart: "Legs",
        group: null,
      },
    ],
  },
  {
    id: "dab74b38-f0d3-4079-9608-217cfaf06451",
    name: "Deadlift (Barbell)",
    bodyPart: "Back",
    image: "/barbell_bench_press.png",
    equipment: "Barbell",
    targetMuscles: [
      {
        id: "ham-1",
        name: "Hamstrings",
        bodyPart: "Legs",
        group: null,
      },
      {
        id: "glutes-1",
        name: "Glutes",
        bodyPart: "Legs",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "erector-1",
        name: "Erector Spinae",
        bodyPart: "Back",
        group: null,
      },
    ],
  },
  {
    id: "a0510beb-c84d-44d2-97a4-6b3dd755f316",
    name: "Overhead Press (Barbell)",
    bodyPart: "Shoulders",
    image: "/barbell_bench_press.png",
    equipment: "Barbell",
    targetMuscles: [
      {
        id: "d0f075f6-831c-43b9-9749-15e1b74987be",
        name: "Deltoid",
        bodyPart: "Shoulders",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "dec5954e-80b5-493b-8911-a73ef54d96ee",
        name: "Triceps brachii",
        bodyPart: "Arms",
        group: null,
      },
    ],
  },
  {
    id: "5b2960a3-bd3e-437d-8aa0-e9cda8c14793",
    name: "Pull-ups",
    bodyPart: "Back",
    image: "/barbell_bench_press.png",
    equipment: "Bodyweight",
    targetMuscles: [
      {
        id: "lat-1",
        name: "Latissimus Dorsi",
        bodyPart: "Back",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "biceps-1",
        name: "Biceps",
        bodyPart: "Arms",
        group: null,
      },
    ],
  },
];
