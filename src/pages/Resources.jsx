import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Tag,
  BookOpen,
  Upload,
  X,
  Star,
  Share2,
  MessageCircle,
  Trash2,
  ChevronDown,
  Heart,
  Send,
  ArrowUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import resourcesAPI from '../services/resourcesAPI';
import engagementAPI from '../services/engagementAPI';
import { cardClasses, buttonClasses, animationClasses } from '../utils/uiClasses';

const Resources = () => {
  const { user } = useUser();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [likedResources, setLikedResources] = useState(new Set());

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    tags: '',
    file: null,
  });

  // Load resources on mount
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const result = await resourcesAPI.getAllResources();
    if (result.ok) {
      setResources(result.resources);
      // Initialize likedResources based on current user's likes
      const userLiked = new Set();
      result.resources.forEach(resource => {
        if (resource.likes?.includes(user?.id)) {
          userLiked.add(resource.id);
        }
      });
      setLikedResources(userLiked);
    }
    setLoading(false);
  };

  // Mock data for resources
  const mockResources = [];

  // Filter and sort resources
  const filteredResources = resources
    .filter(resource => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
      const matchesType = filterType === 'all' || resource.type === filterType;

      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'downloads':
          return b.downloads - a.downloads;
        case 'views':
          return b.views - a.views;
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        default:
          return 0;
      }
    });

  const handleUploadChange = useCallback((e) => {
    const { name, value } = e.target;
    setUploadData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file,
      }));
    }
  }, []);

  const handleUpload = async () => {
    if (
      !uploadData.title ||
      !uploadData.description ||
      !uploadData.category ||
      !uploadData.type ||
      !uploadData.file
    ) {
      alert('Please fill all fields');
      return;
    }

    if (!user?.id) {
      alert('You must be logged in to upload');
      return;
    }

    const tags = uploadData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      const result = await resourcesAPI.uploadResource(
        uploadData.file,
        {
          title: uploadData.title,
          description: uploadData.description,
          category: uploadData.category,
          type: uploadData.type,
          tags,
          uploaderName: user.displayName || user.email,
        },
        user.id
      );

      if (result.ok) {
        alert('Resource uploaded successfully!');
        setResources([result, ...resources]);
        setShowUploadModal(false);
        setUploadData({
          title: '',
          description: '',
          category: '',
          type: '',
          tags: '',
          file: null,
        });
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.error || error.message || 'Upload failed');
    }
  };

  const handleDownload = async (resource) => {
    await resourcesAPI.incrementDownloads(resource.id);
    // Download file from base64 data
    const link = document.createElement('a');
    link.href = resource.fileData || resource.fileUrl; // Use fileData (base64) if available
    link.download = resource.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (resource) => {
    const shareText = `Check out this resource: "${resource.title}" - ${resource.description}`;
    const shareUrl = `${window.location.origin}`;

    // Copy to clipboard
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    alert('Resource link copied to clipboard!');

    // Social sharing URLs (optional)
    const encodedText = encodeURIComponent(shareText);
    console.log('Share URLs:');
    console.log('Twitter:', `https://twitter.com/intent/tweet?text=${encodedText}`);
    console.log('Facebook:', `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
    console.log('LinkedIn:', `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`);
  };

  const handleAddRating = async () => {
    if (!selectedResourceId) return;

    const result = await resourcesAPI.addRating(
      selectedResourceId,
      user.id,
      selectedRating,
      reviewText
    );

    if (result.ok) {
      alert('Rating and review added successfully!');
      // Reload resources to show updated rating
      loadResources();
      setShowRatingModal(false);
      setReviewText('');
      setSelectedRating(5);
    } else {
      alert(result.error || 'Failed to add rating');
    }
  };

  const handleDeleteResource = async (resourceId, fileName) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    const result = await resourcesAPI.deleteResource(resourceId, user.id, fileName);
    if (result.ok) {
      alert('Resource deleted successfully!');
      setResources(resources.filter(r => r.id !== resourceId));
    } else {
      alert(result.error || 'Failed to delete resource');
    }
  };

  const handleToggleLike = async (resourceId) => {
    const result = await engagementAPI.toggleResourceLike(resourceId, user.id);
    if (result.ok) {
      const newLiked = new Set(likedResources);
      if (result.liked) {
        newLiked.add(resourceId);
      } else {
        newLiked.delete(resourceId);
      }
      setLikedResources(newLiked);
      loadResources();
    }
  };

  const handleAddComment = async (resourceId) => {
    if (!commentText[resourceId]?.trim()) return;

    const result = await engagementAPI.addResourceComment(
      resourceId,
      user.id,
      user.displayName || user.email,
      commentText[resourceId]
    );

    if (result.ok) {
      setCommentText(prev => ({ ...prev, [resourceId]: '' }));
      loadResources();
    } else {
      alert(result.error || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (resourceId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    const result = await engagementAPI.deleteResourceComment(resourceId, commentId);
    if (result.ok) {
      loadResources();
    } else {
      alert(result.error || 'Failed to delete comment');
    }
  };

  const RatingModal = () => (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={(e) => e.target === e.currentTarget && setShowRatingModal(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Rate & Review</h2>
          <button
            onClick={() => setShowRatingModal(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Your Rating</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(star => (
                <motion.button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg transition-all ${
                    star <= selectedRating
                      ? 'text-yellow-400 bg-yellow-50'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star className="w-8 h-8 fill-current" />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Review (optional)</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this resource..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all h-20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowRatingModal(false)}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRating}
              className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg font-semibold transition-all"
            >
              Submit Review
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const ResourceCard = ({ resource, index }) => (
    <motion.div 
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
        <img
          src={resource.thumbnail}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
            {resource.type}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">{resource.title}</h3>
          <span className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
            {resource.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags && resource.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full flex items-center font-medium">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
              <Link to={`/profile/${resource.ownerId}`} className="hover:text-primary-600 font-medium transition-colors">
                {resource.uploader}
              </Link>
            </span>
          </div>
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {new Date(resource.uploadDate?.toDate?.() || resource.uploadDate).toLocaleDateString()}
          </span>
        </div>

        {/* Rating Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(resource.averageRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs text-gray-600 ml-2 font-semibold">
              ({resource.ratings?.length || 0})
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 font-semibold">
            <span className="flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1" />
              {resource.views || 0}
            </span>
            <span className="flex items-center">
              <Download className="w-3.5 h-3.5 mr-1" />
              {resource.downloads || 0}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => handleDownload(resource)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all text-xs font-semibold flex items-center justify-center"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download
          </motion.button>
          <motion.button
            onClick={() => handleToggleLike(resource.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={likedResources.has(resource.id)}
            className={`px-3 py-2.5 rounded-lg transition-all text-xs font-semibold flex items-center justify-center ${
              likedResources.has(resource.id)
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 mr-1 ${likedResources.has(resource.id) ? 'fill-current' : ''}`} />
            {resource.likes?.length || 0}
          </motion.button>
          <motion.button
            onClick={() => {
              setSelectedResourceId(resource.id);
              setShowRatingModal(true);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-xs font-semibold flex items-center justify-center"
          >
            <Star className="w-3.5 h-3.5 mr-1" />
            Rate
          </motion.button>
          <motion.button
            onClick={() => handleShare(resource)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-xs font-semibold flex items-center justify-center"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" />
            Share
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3">Resources Hub</h1>
              <p className="text-gray-600 text-lg">Discover and share learning materials with your community</p>
            </div>
            {user && (
              <motion.button
                onClick={() => setShowUploadModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-xl text-white px-8 py-4 rounded-xl font-bold flex items-center transition-all shadow-lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Resource
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col gap-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business">Business</option>
                <option value="Engineering">Engineering</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white"
              >
                <option value="all">All Types</option>
                <option value="PDF">PDF</option>
                <option value="Video">Video</option>
                <option value="Notebook">Notebook</option>
                <option value="Slide">Slide</option>
                <option value="Document">Document</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white col-span-1 sm:col-span-2 lg:col-span-1"
              >
                <option value="recent">Sort: Recent</option>
                <option value="downloads">Sort: Downloads</option>
                <option value="views">Sort: Views</option>
                <option value="rating">Sort: Rating</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Resources Grid */}
        <div>
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredResources.length} <span className="text-primary-600">Resources</span>
            </h2>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <motion.div 
                className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          ) : filteredResources.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {filteredResources.map((resource, idx) => (
                <ResourceCard key={resource.id} resource={resource} index={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 text-lg">Try adjusting your search or filter criteria.</p>
            </motion.div>
          )}
        </div>
      </div>

      {showUploadModal && <UploadModalComponent 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadData={uploadData}
        onUploadChange={handleUploadChange}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />}
      {showRatingModal && <RatingModal />}
    </div>
  );
};

// Separate UploadModal Component to prevent re-renders
const UploadModalComponent = ({ 
  isOpen, 
  onClose, 
  uploadData, 
  onUploadChange, 
  onFileChange, 
  onUpload 
}) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Upload Resource</h2>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={uploadData.title}
              onChange={onUploadChange}
              placeholder="Resource title"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={uploadData.description}
              onChange={onUploadChange}
              placeholder="Resource description"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all h-24 resize-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={uploadData.category}
                onChange={onUploadChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white"
              >
                <option value="">Select category</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Data Science">Data Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Business">Business</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type *</label>
              <select
                name="type"
                value={uploadData.type}
                onChange={onUploadChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white"
              >
                <option value="">Select type</option>
                <option value="PDF">PDF</option>
                <option value="Video">Video</option>
                <option value="Notebook">Notebook</option>
                <option value="Slide">Slide</option>
                <option value="Document">Document</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={uploadData.tags}
              onChange={onUploadChange}
              placeholder="e.g., React, JavaScript, Frontend"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Select File *</label>
            <input
              type="file"
              onChange={onFileChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-medium"
            />
            {uploadData.file && (
              <p className="text-sm text-primary-600 font-semibold mt-2">✓ {uploadData.file.name}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={onUpload}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:shadow-lg font-bold transition-all flex items-center"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Resources;

