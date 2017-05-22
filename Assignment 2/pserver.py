from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json
import operator
from bson import json_util
import pandas as panda
import random
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.manifold import MDS
from sklearn import cluster as Kcluster, metrics as Met ,preprocessing as preprocessing
import numpy as np
from scipy.spatial.distance import cdist
from sklearn.decomposition import PCA as sklearnPCA

app = Flask(__name__)
d_data = 0
MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'vis2'
COLLECTION_NAME = 'cancerdata'
FIELDS = {'radius_mean':True,
          'texture_mean':True,
          'perimeter_mean':True,
          'area_mean':True,
          'smoothness_mean':True,
          'compactness_mean':True,
          'concavity_mean':True,
          'concave points_mean':True,
          'symmetry_mean':True,
          'fractal_dimension_mean':True,
           '_id': False}

FIELD = ['radius_mean','texture_mean','perimeter_mean','area_mean','smoothness_mean','compactness_mean','concavity_mean','concave points_mean','symmetry_mean','fractal_dimension_mean']

@app.route("/vis2/scatterplotmatrixRandom")
def plot_scatterplot_matrix_random():
    global loading_random
    global loading_stratified

    sorted_loading_random = sorted(loading_random.items(), key=operator.itemgetter(1),reverse=True)
    #get the top 3 attribute from the PCA loading
    top_attr = [(i[0]) for i in sorted_loading_random[:3]]
    csvData= get_data()
    data_for_top_attr = []
    #get the data for the top 3 attribute from the datastore
    for data in csvData:
        temp =[]
        for test in top_attr:
            temp.append(data[test])
        data_for_top_attr.append(temp)
    #normalize the data obtained
    norm_data_for_top_attr = preprocessing.scale(np.array(data_for_top_attr))

    #Map the normalized values to the attribute name so as to form data of the form - attr:value
   # norm_data_attr_list = norm_data_for_top_attr.tolist()
    #norm_data_attr_list.insert(0,top_attr)
    scatterplot_matrix_for_plot = {
        "attr":top_attr,
        "data":norm_data_for_top_attr.tolist()
    }

    scatterplot_matrix_random = json.dumps(scatterplot_matrix_for_plot, default=json_util.default)
    return scatterplot_matrix_random

@app.route("/vis2/scatterplotmatrixStratified")
def plot_scatterplot_matrix_stratified():
    global loading_random
    global loading_stratified

    sorted_loading_stratified = sorted(loading_stratified.items(), key=operator.itemgetter(1),reverse=True)

    #get the top 3 attribute from the PCA loading
    top_attr = [(i[0]) for i in sorted_loading_stratified[:3]]
    csvData= get_data()
    data_for_top_attr = []
    #get the data for the top 3 attribute from the datastore
    for data in csvData:
        temp =[]
        for test in top_attr:
            temp.append(data[test])
        data_for_top_attr.append(temp)
    #normalize the data obtained
    norm_data_for_top_attr = preprocessing.scale(np.array(data_for_top_attr))

    #Map the normalized values to the attribute name so as to form data of the form - attr:value
   # norm_data_attr_list = norm_data_for_top_attr.tolist()
    #norm_data_attr_list.insert(0,top_attr)
    scatterplot_matrix_for_plot_stratified = {
        "attr":top_attr,
        "data":norm_data_for_top_attr.tolist()
    }

    scatterplot_matrix_stratified = json.dumps(scatterplot_matrix_for_plot_stratified, default=json_util.default)
    return scatterplot_matrix_stratified


@app.route("/vis2/mds_euclidean")
def plot_euclidean_MDS():
    global random_norm_data;
    global stratified_norm_data;
    euclidean_random_dis_mat = Met.pairwise_distances(random_norm_data, metric = 'euclidean')
    mds = MDS(n_components=2, dissimilarity='precomputed')
    euclidean_random_mds = mds.fit_transform(euclidean_random_dis_mat)

    euclidean_stratified_dis_mat = Met.pairwise_distances(stratified_norm_data, metric = 'euclidean')
    mds = MDS(n_components=2, dissimilarity='precomputed')
    euclidean_stratified_mds = mds.fit_transform(euclidean_stratified_dis_mat)

    euclidiean_mds_for_plot = {
        "random":euclidean_random_mds.tolist(),
        "stratified":euclidean_stratified_mds.tolist()
    }
    euclidiean_mds_for_plot = json.dumps(euclidiean_mds_for_plot, default=json_util.default)
    return euclidiean_mds_for_plot

@app.route("/vis2/mds_correlation")
def plot_correlation_MDS():
    global random_norm_data;
    global stratified_norm_data;
    correlation_random_dis_mat = Met.pairwise_distances(random_norm_data, metric='correlation')
    mds = MDS(n_components=2, dissimilarity='precomputed')
    correlation_random_mds = mds.fit_transform(correlation_random_dis_mat)

    correlation_stratified_dis_mat = Met.pairwise_distances(stratified_norm_data, metric='correlation')
    mds = MDS(n_components=2, dissimilarity='precomputed')
    correlation_stratified_mds = mds.fit_transform(correlation_stratified_dis_mat)

    correlation_mds_for_plot = {
        "random": correlation_random_mds.tolist(),
        "stratified": correlation_stratified_mds.tolist()
    }
    correlation_mds_for_plot = json.dumps(correlation_mds_for_plot, default=json_util.default)
    return correlation_mds_for_plot


@app.route("/")
def home():
    #return "Ajin"
    return render_template("dashboard.html")

#hack for dash
@app.route("/dashboard.html")
def dash():
    return render_template("dashboard.html")

@app.route("/vis2/initialize")
def initialize():
    global loading_random
    global loading_stratified

    #Sort the data in descending order . The sorted list contains the attribute name as wel as value.
    sorted_loading_random = sorted(loading_random.items(), key=operator.itemgetter(1),reverse=True)
    sorted_loading_stratified = sorted(loading_stratified.items(), key=operator.itemgetter(1),reverse=True)
    combined_data_for_plot = {
        "random":sorted_loading_random,
        "stratified":sorted_loading_stratified
    }
    combined_data_for_plot = json.dumps(combined_data_for_plot, default=json_util.default)
    return combined_data_for_plot

#Returns the loadings for each of the attribute from the PCA data.
def get_loadings(pcadata):
    sumofsquare = []
    for i in pcadata:
        sum = 0
        for j in i:
            sum += j*j
        sumofsquare.append(sum)
    sumofsquaredict = dict(zip(FIELD,sumofsquare))
    return sumofsquaredict

def get_eigenvalues(data):
    U, V, W = np.linalg.svd(data, full_matrices=False)
    return V
# Perform PCA on the correlation matrix. The output of the SVD phase contains the eigenvectors and eigenvalues.
def perf_pca(data):
    U, V, W = np.linalg.svd(data, full_matrices=False)
    # print(U)
    newV = [x for x in V if x >= 1]
    # find the number of principal components.
    # select the components with eigenvalue greater than 1.
    dim = len(newV)
    sk_pca = sklearnPCA(n_components=dim)
    pca = sk_pca.fit_transform(data)
    return pca

@app.route("/vis2/intrinsic")
def intrinsic():
    global random_corr_data
    global stratified_corr_data

    eig_randum = get_eigenvalues(random_corr_data)
    eig_stratified = get_eigenvalues(stratified_corr_data)

    combined_data_scree = {
        "random":eig_randum.tolist(),
        "stratified":eig_stratified.tolist()
    }

    combined_data_scree = json.dumps(combined_data_scree, default=json_util.default)
    return combined_data_scree


@app.route("/vis2/scatterplot")
def scatterplot():
    global points_random
    global points_stratified


    combined_data_scatter_plot = {
        "random":points_random.tolist(),
        "stratified":points_stratified.tolist()
    }

    combined_data_scatter_plot = json.dumps(combined_data_scatter_plot, default=json_util.default)
    return combined_data_scatter_plot

@app.route("/vis2/kmeans")
def plot_kmeans():
    global d_data #get the 2D data.
    # perform k means clustering with k varying from 1 to 15.
    kMeansVar = [KMeans(n_clusters=k).fit(d_data) for k in range(1, 15)]
    centroids = [X.cluster_centers_ for X in kMeansVar]
    #find the centroids of each clusters and compute the means squared error
    k_euclid = [cdist(d_data, cent) for cent in centroids]
    dist = [np.min(ke, axis=1) for ke in k_euclid]
    #Pass the data to d3, to plot the elbow curve using different values of K and their errors
    wcss = [sum(d**2) for d in dist]
    plotwcss = {"0": wcss}
    plotwcss = json.dumps(plotwcss, default=json_util.default)
    return plotwcss

#Takes the data as input and form 3 clusters using k-means clustering algorithm
def get_clusters(data):

    cluster ={
        "0": list(),
        "1": list(),
        "2": list()
    }
    k_means = Kcluster.KMeans(n_clusters=3).fit(data).labels_
    for i in range(len(k_means)):
        cluster[str(k_means[i])].append(data[i])
    return cluster




def random_sample(data):
    # rsample = random.sample(data,(int)(len(data)*0.2))
    rsample = random.sample(data, (int)(len(data) * 0.5))
    return rsample

def stratified_sample(data):
    clusters=get_clusters(data)
    ssample =[]
    for i in clusters:
        ssample += random.sample(clusters[str(i)],(int)(len(clusters[str(i)])*0.5))
    return ssample


def get_data():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    cancerdata = collection.find(projection=FIELDS)
    json_cancerdata = []
    for d in cancerdata:
        json_cancerdata.append(d)
        connection.close()
    return json_cancerdata


def get_2d_data():
    json_cancerdata = get_data()
    result = []
    for data in json_cancerdata:
        temp =[]
        for test in FIELD:
            temp.append(data[test])
        result.append(temp)

    return result

#testing without the use of MongoDB
@app.route("/vis2/test")
def dispcsv_cancerdata():
    cancerDF = panda.read_csv('C:\\Users\\ajinkuriakose\\Desktop\\Visualization\\Assignment2\\cancer-data.csv')
    return cancerDF

d_data = get_2d_data()

# Get the random sample and the stratified sample
rsample = random_sample(d_data)
ssample = stratified_sample(d_data)

# Normalize the data
random_norm_data = preprocessing.scale(np.array(rsample))
stratified_norm_data = preprocessing.scale(np.array(ssample))

# Compute the correlation matrix
random_corr_data = np.corrcoef(random_norm_data, rowvar=False)
stratified_corr_data = np.corrcoef(stratified_norm_data, rowvar=False)

# Get the PCA for the correlation data.
pca_random = perf_pca(random_corr_data)
pca_stratified = perf_pca(stratified_corr_data)
# print(pcarandom)

# get the loadings for each PCA
loading_random = get_loadings(pca_random)
loading_stratified = get_loadings(pca_stratified)

# get the points based on PCA
points_random = np.dot(random_norm_data, pca_random)
points_stratified = np.dot(stratified_norm_data, pca_stratified)

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)

