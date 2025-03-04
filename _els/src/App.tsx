import React, { useState, useEffect } from "react";
import {
  Brain,
  Book,
  Search,
  Tag,
  Plus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { supabase, checkSupabaseConnection } from "./lib/supabase";
import { Experience, Response } from "./types";
import { ExperienceInsights } from "./components/ExperienceInsights";

interface Experience {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  created_at: string;
  votes: number;
  user_id: string;
  responses: Response[];
}

interface Response {
  id: string;
  text: string;
  helpful: boolean;
  user_id: string;
  created_at: string;
}

// Fallback data in case Supabase connection fails
const fallbackExperiences: Experience[] = [
  {
    id: "1",
    title: "Implementing CI/CD Pipeline",
    description:
      "I learned how to set up a CI/CD pipeline using GitHub Actions for our React application. This significantly improved our deployment process and reduced manual errors.",
    category: "Technical",
    tags: ["DevOps", "GitHub", "Automation"],
    created_at: new Date().toISOString(),
    votes: 15,
    user_id: "1",
    responses: [
      {
        id: "101",
        text: "Great insight! We implemented something similar and it saved us hours of work each week.",
        helpful: true,
        user_id: "2",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "2",
    title: "Effective Code Reviews",
    description:
      "I found that implementing a structured code review process with clear guidelines improved our code quality and team collaboration.",
    category: "Process",
    tags: ["Collaboration", "Quality", "Team"],
    created_at: new Date().toISOString(),
    votes: 8,
    user_id: "3",
    responses: [],
  },
  {
    id: "3",
    title: "Handling Difficult Client Conversations",
    description:
      "I learned techniques for navigating challenging conversations with clients about project scope and timeline changes.",
    category: "Communication",
    tags: ["Client Relations", "Soft Skills"],
    created_at: new Date().toISOString(),
    votes: 12,
    user_id: "4",
    responses: [
      {
        id: "102",
        text: "Setting expectations early is key. I also found that regular updates help prevent surprises.",
        helpful: true,
        user_id: "5",
        created_at: new Date().toISOString(),
      },
    ],
  },
];

function App() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [newResponse, setNewResponse] = useState("");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const categories = [
    "Technical",
    "Process",
    "Communication",
    "Problem Solving",
    "Leadership",
  ];

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      let retryCount = 0;
      const maxRetries = 3;

      const tryConnection = async () => {
        try {
          // First check if Supabase is reachable
          const isConnected = await checkSupabaseConnection();

          if (!isConnected) {
            if (retryCount < maxRetries) {
              retryCount++;
              toast.loading(
                `Attempting to connect (try ${retryCount}/${maxRetries})...`
              );
              // Exponential backoff
              await new Promise((resolve) =>
                setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1))
              );
              return tryConnection();
            }

            console.log("Supabase connection failed, entering offline mode");
            setConnectionError(true);
            setOfflineMode(true);
            setExperiences(fallbackExperiences);
            toast.dismiss();
            toast.error(
              "Unable to connect to the server. Working in offline mode."
            );
            return;
          }

          // Connection successful, clear any previous error states
          setConnectionError(false);
          setOfflineMode(false);
          toast.dismiss();

          // Check auth state
          try {
            const {
              data: { session },
              error: authError,
            } = await supabase.auth.getSession();
            if (authError) {
              console.error("Auth error:", authError);
              toast.error("Authentication error. Please try again.");
            }
            setUser(session?.user ?? null);
          } catch (error) {
            console.error("Auth session error:", error);
            toast.error("Failed to check authentication status.");
          }

          // Set up auth listener
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
          });

          // Fetch initial experiences
          await fetchExperiences();

          return () => subscription.unsubscribe();
        } catch (error) {
          console.error("App initialization error:", error);
          if (retryCount < maxRetries) {
            retryCount++;
            toast.loading(
              `Attempting to connect (try ${retryCount}/${maxRetries})...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1))
            );
            return tryConnection();
          }

          setConnectionError(true);
          setOfflineMode(true);
          setExperiences(fallbackExperiences);
          toast.dismiss();
          toast.error(
            "Failed to initialize the application. Working in offline mode."
          );
        }
      };

      await tryConnection();
      setAuthLoading(false);
      setLoading(false);
    };

    initializeApp();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);

      if (offlineMode) {
        // In offline mode, just use fallback data
        setExperiences(fallbackExperiences);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("experiences")
        .select(
          `
          *,
          responses (*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setExperiences(data || []);
      setConnectionError(false);
    } catch (error) {
      console.error("Error fetching experiences:", error);

      if (!offlineMode) {
        toast.error(
          "Failed to connect to database. Showing sample data instead."
        );
        setExperiences(fallbackExperiences);
        setConnectionError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const addExperience = async () => {
    if (!user && !offlineMode) {
      toast.error("Please sign in to share experiences");
      return;
    }

    if (
      !newExperience.title ||
      !newExperience.description ||
      !newExperience.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (offlineMode || connectionError) {
        // In offline mode, simulate adding an experience
        const newExp: Experience = {
          id: Math.random().toString(36).substring(2, 9),
          title: newExperience.title,
          description: newExperience.description,
          category: newExperience.category,
          tags: newExperience.tags,
          created_at: new Date().toISOString(),
          votes: 0,
          user_id: user?.id || "offline-user",
          responses: [],
        };

        setExperiences((prev) => [newExp, ...prev]);
        toast.success("Experience shared successfully! (Offline Mode)");
      } else {
        const { error } = await supabase.from("experiences").insert([
          {
            title: newExperience.title,
            description: newExperience.description,
            category: newExperience.category,
            tags: newExperience.tags,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
        toast.success("Experience shared successfully!");
        fetchExperiences();
      }

      setNewExperience({ title: "", description: "", category: "", tags: [] });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding experience:", error);
      toast.error("Failed to share experience");
    }
  };

  const addTag = () => {
    if (currentTag && !newExperience.tags.includes(currentTag)) {
      setNewExperience((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewExperience((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addResponse = async (experienceId: string) => {
    if (!user && !offlineMode) {
      toast.error("Please sign in to respond");
      return;
    }

    if (!newResponse.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      if (offlineMode || connectionError) {
        // In offline mode, simulate adding a response
        const newResp: Response = {
          id: Math.random().toString(36).substring(2, 9),
          text: newResponse,
          helpful: true,
          user_id: user?.id || "offline-user",
          created_at: new Date().toISOString(),
        };

        setExperiences((prev) =>
          prev.map((exp) =>
            exp.id === experienceId
              ? { ...exp, responses: [...(exp.responses || []), newResp] }
              : exp
          )
        );

        toast.success("Response added successfully! (Offline Mode)");
      } else {
        const { error } = await supabase.from("responses").insert([
          {
            experience_id: experienceId,
            text: newResponse,
            helpful: true,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
        toast.success("Response added successfully!");
        fetchExperiences();
      }

      setNewResponse("");
      setRespondingTo(null);
    } catch (error) {
      console.error("Error adding response:", error);
      toast.error("Failed to add response");
    }
  };

  const vote = async (experienceId: string, increment: number) => {
    if (!user && !offlineMode) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      if (offlineMode || connectionError) {
        // In offline mode, simulate voting
        setExperiences((prev) =>
          prev.map((exp) =>
            exp.id === experienceId
              ? { ...exp, votes: exp.votes + increment }
              : exp
          )
        );

        toast.success("Vote registered! (Offline Mode)");
      } else {
        const { error } = await supabase.rpc("increment_votes", {
          experience_id: experienceId,
          increment_amount: increment,
        });

        if (error) throw error;
        fetchExperiences();
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to register vote");
    }
  };

  const handleSignIn = async () => {
    if (offlineMode || connectionError) {
      toast.error("Cannot sign in while in offline mode");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const handleSignOut = async () => {
    if (offlineMode || connectionError) {
      setUser(null);
      toast.success("Signed out (Offline Mode)");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
      console.error("Sign out error:", error);
    }
  };

  const retryConnection = async () => {
    setReconnecting(true);
    toast.loading("Attempting to reconnect...");

    try {
      const isConnected = await checkSupabaseConnection();

      if (isConnected) {
        setOfflineMode(false);
        setConnectionError(false);
        await fetchExperiences();
        toast.dismiss();
        toast.success("Successfully reconnected!");

        // Re-check auth state after reconnection
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();
        if (authError) {
          console.error("Auth error after reconnection:", authError);
          toast.error("Authentication error after reconnection.");
        }
        setUser(session?.user ?? null);
      } else {
        toast.dismiss();
        toast.error("Still unable to connect. Remaining in offline mode.");
      }
    } catch (error) {
      console.error("Reconnection attempt failed:", error);
      toast.dismiss();
      toast.error("Reconnection failed. Please try again later.");
    } finally {
      setReconnecting(false);
    }
  };

  const filteredExperiences = experiences
    .filter(
      (exp) =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .filter(
      (exp) => selectedCategory === "all" || exp.category === selectedCategory
    );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Experience Learning System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {(connectionError || offlineMode) && (
                <button
                  onClick={retryConnection}
                  disabled={reconnecting}
                  className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 flex items-center space-x-1"
                >
                  {reconnecting ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  <span>Reconnect</span>
                </button>
              )}

              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={offlineMode || connectionError}
                >
                  Sign In with GitHub
                </button>
              )}
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center space-x-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!user && !offlineMode && !connectionError}
              >
                <Plus className="h-5 w-5" />
                <span>Share Experience</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {(connectionError || offlineMode) && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Offline Mode:</strong> Unable to connect to the
                  database. Showing sample data instead.
                  <button
                    onClick={retryConnection}
                    disabled={reconnecting}
                    className="ml-2 underline text-yellow-800 hover:text-yellow-900"
                  >
                    Try reconnecting
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!user && !offlineMode && !connectionError && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please sign in to share experiences and interact with the
                  community.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search experiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* New Experience Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Share Your Experience
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) =>
                    setNewExperience((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) =>
                    setNewExperience((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={newExperience.category}
                  onChange={(e) =>
                    setNewExperience((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Add tags..."
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {newExperience.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addExperience}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Experience List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredExperiences.length > 0 ? (
          <div className="space-y-6">
            {filteredExperiences.map((experience) => (
              <div
                key={experience.id}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {experience.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {experience.category}
                      </span>
                      {experience.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => vote(experience.id, 1)}
                      className="text-gray-400 hover:text-green-600"
                      disabled={!user && !offlineMode && !connectionError}
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </button>
                    <span className="text-gray-600">{experience.votes}</span>
                    <button
                      onClick={() => vote(experience.id, -1)}
                      className="text-gray-400 hover:text-red-600"
                      disabled={!user && !offlineMode && !connectionError}
                    >
                      <ThumbsDown className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{experience.description}</p>

                {/* Responses */}
                <div className="mt-4 space-y-3">
                  {experience.responses?.map((response) => (
                    <div
                      key={response.id}
                      className={`p-3 rounded-lg ${
                        response.helpful ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      <p className="text-sm text-gray-600">{response.text}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        {new Date(response.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}

                  {(user || offlineMode || connectionError) && (
                    <div className="mt-4">
                      {respondingTo === experience.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={newResponse}
                            onChange={(e) => setNewResponse(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setNewResponse("");
                              }}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => addResponse(experience.id)}
                              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(experience.id)}
                          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Add Response</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* ExperienceInsights component */}
                <ExperienceInsights experience={experience} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No experiences found
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to share an experience!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
