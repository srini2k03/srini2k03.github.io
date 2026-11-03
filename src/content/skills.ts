import { projects } from "./projects";

export const skillGroups = [
  { name: "Languages", skills: ["Python", "SQL", "C++", "Java", "Kotlin"] },
  {
    name: "ML & Deep Learning",
    skills: ["Scikit-Learn", "XGBoost", "LightGBM", "CatBoost", "TensorFlow/Keras", "OpenCV", "Optuna", "SHAP"],
  },
  {
    name: "LLMs & GenAI",
    skills: [
      "RAG",
      "Hugging Face Transformers",
      "TRL (LoRA fine-tuning)",
      "Qdrant",
      "BM25",
      "Cross-Encoder Reranking",
      "Ollama",
      "llama.cpp/GGUF Quantization",
    ],
  },
  {
    name: "MLOps & Deployment",
    skills: ["MLflow", "DVC", "Prefect", "Evidently", "Docker", "FastAPI", "Flask", "GitHub Actions (CI/CD)", "Pytest", "Linux"],
  },
  {
    name: "Data & Analytics",
    skills: ["pandas", "NumPy", "DuckDB", "PostgreSQL", "MySQL", "MongoDB", "Streamlit", "A/B Testing", "Statistical Inference"],
  },
] as const;

/** For each skill, the projects that actually use it (derived, never hand-typed). */
export function evidenceFor(skill: string) {
  return projects.filter((p) => p.skills.includes(skill));
}
