

class Node(object):
	def __init__(self, name):
		self.left = None
		self.right = None
		self.name = name

class Tree(object):
	def __init__(self):
		self.root = None

	def addNode(self, name):
		#internal use
		return Node(name)

	def insert(self, root, name):
		#external/internal call to add nodes
		if root == None:
			return self.addNode(name)
		else:
			if root.left == None:
				root.left = self.insert(root.left, name)
			else:
				root.right = self.insert(root.right, name)

			return root

	def build(self, root, path):
		#external/internal call to build from path
		index = 0
		if root == None:
			root = self.addNode(path[index])
			index += 1
		elif root.name == path[index]:
			index += 1
		elif root.name != path[index]:
			raise "More children needed"

		if index < len(path):
			if root.left == None:
				root.left = self.build(root.left, path[index:])
			elif root.left.name == path[index]:
				self.build(root.left, path[index:])
			elif root.right == None:
				root.right = self.build(root.right, path[index:])
			elif root.right.name == path[index]:
				self.build(root.right, path[index:])



		return root


	def printTree(self, root):
		if root == None:
			pass
		else:
			self.printTree(root.left)
			print root.name
			self.printTree(root.right)


def SplitPath(path):
	parts = []
	
	parts = path.split("/")

	while "" in parts:
		parts.remove("")

	return parts


# Question directions
treeQ = Tree()
rootQ = None

print "Inserting /home/sports/basketball/ncaa"
print "Then /home/music/rap/gangster"
rootQ = treeQ.build(rootQ, SplitPath("/home/sports/basketball/ncaa"))
rootQ = treeQ.build(rootQ, SplitPath("/home/music/rap/gangster :"))

# depth-first, in-order binary tree output
treeQ.printTree(rootQ)
print

# Tree from the image
treeP = Tree()
rootP = None
print "Building a Tree to match the image"
print "Then inserting /home/music/rap/gangster to add the leaf :"
rootP = treeP.build(rootP, SplitPath("/home/sports/basketball/ncaa"))
rootP = treeP.build(rootP, SplitPath("/home/sports/football"))
rootP = treeP.build(rootP, SplitPath("/home/music/rap"))
rootP = treeP.build(rootP, SplitPath("/home/music/rock"))

rootP = treeP.build(rootP, SplitPath("/home/music/rap/gangster"))

# depth-first, in-order binary tree output
treeP.printTree(rootP)

""" OUTPUT 

C:\Users\Ben\Documents\GitHub\misc>1InsertIntoTree.py
Inserting /home/sports/basketball/ncaa
Then /home/music/rap/gangster
ncaa
basketball
sports
home
gangster
rap
music

"""